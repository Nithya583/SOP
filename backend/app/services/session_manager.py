import time
import secrets
import threading
import os
from typing import Dict, Any, Optional, List
from app.config import settings


class Session:
    def __init__(self, session_id: str):
        self.session_id: str = session_id
        self.created_at: float = time.time()
        self.last_accessed_at: float = time.time()
        self.documents: Dict[str, Dict[str, Any]] = {}
        self.chat_history: List[Dict[str, Any]] = []
        self.translations: List[Dict[str, Any]] = []
        self.temp_file_paths: List[str] = []

    def touch(self):
        self.last_accessed_at = time.time()

    def is_expired(self, ttl_minutes: int) -> bool:
        return (time.time() - self.last_accessed_at) > (ttl_minutes * 60)

    def cleanup_files(self):
        for path in self.temp_file_paths:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass
        self.temp_file_paths.clear()

        # Also cleanup individual document files if any
        for doc in self.documents.values():
            for path in doc.get("temp_file_paths", []):
                try:
                    if os.path.exists(path):
                        os.remove(path)
                except Exception:
                    pass


class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, Session] = {}
        self._lock = threading.Lock()

    def get_or_create_session(self, session_id: Optional[str] = None) -> Session:
        with self._lock:
            if session_id and session_id in self._sessions:
                session = self._sessions[session_id]
                session.touch()
                return session

            new_session_id = session_id or secrets.token_urlsafe(32)
            session = Session(session_id=new_session_id)
            self._sessions[new_session_id] = session
            return session

    def get_session(self, session_id: str) -> Optional[Session]:
        with self._lock:
            session = self._sessions.get(session_id)
            if session:
                if session.is_expired(settings.SESSION_TTL_MINUTES):
                    session.cleanup_files()
                    del self._sessions[session_id]
                    return None
                session.touch()
                return session
            return None

    def add_document(
        self,
        session_id: str,
        document_id: str,
        filename: str,
        file_size: int,
        content_type: str,
        extracted_text: str,
        temp_file_paths: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        session = self.get_or_create_session(session_id)
        with self._lock:
            doc_record = {
                "document_id": document_id,
                "filename": filename,
                "file_size": file_size,
                "content_type": content_type,
                "extracted_text": extracted_text,
                "character_count": len(extracted_text),
                "upload_timestamp": time.time(),
                "analysis": None,
                "analysis_status": "pending",
                "temp_file_paths": temp_file_paths or []
            }
            session.documents[document_id] = doc_record
            session.touch()
            return doc_record

    def get_document(self, session_id: str, document_id: str) -> Optional[Dict[str, Any]]:
        session = self.get_session(session_id)
        if not session:
            return None
        with self._lock:
            doc = session.documents.get(document_id)
            if doc:
                session.touch()
            return doc

    def find_document_globally(self, document_id: str) -> Optional[tuple[Session, Dict[str, Any]]]:
        """Finds a document across active sessions by its unguessable ID."""
        with self._lock:
            for session in self._sessions.values():
                if session.is_expired(settings.SESSION_TTL_MINUTES):
                    continue
                if document_id in session.documents:
                    session.touch()
                    return session, session.documents[document_id]
        return None

    def update_document_analysis(self, session_id: str, document_id: str, analysis: Any):
        session = self.get_session(session_id)
        if session and document_id in session.documents:
            with self._lock:
                session.documents[document_id]["analysis"] = analysis
                session.documents[document_id]["analysis_status"] = "completed"
                session.touch()

    def delete_document(self, session_id: str, document_id: str) -> bool:
        session = self.get_session(session_id)
        if not session:
            # Try global find
            found = self.find_document_globally(document_id)
            if found:
                session, _ = found
            else:
                return False

        with self._lock:
            if document_id in session.documents:
                doc = session.documents.pop(document_id)
                for path in doc.get("temp_file_paths", []):
                    try:
                        if os.path.exists(path):
                            os.remove(path)
                    except Exception:
                        pass
                session.touch()
                return True
            return False

    def clear_session(self, session_id: str) -> Dict[str, Any]:
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return {"documents_cleared": 0, "chat_cleared": 0, "translations_cleared": 0}

            docs_count = len(session.documents)
            chat_count = len(session.chat_history)
            trans_count = len(session.translations)

            session.cleanup_files()
            del self._sessions[session_id]

            return {
                "documents_cleared": docs_count,
                "chat_cleared": chat_count,
                "translations_cleared": trans_count
            }

    def cleanup_expired_sessions(self) -> int:
        cleaned_count = 0
        with self._lock:
            now = time.time()
            ttl_seconds = settings.SESSION_TTL_MINUTES * 60
            expired_ids = [
                sid for sid, s in self._sessions.items()
                if (now - s.last_accessed_at) > ttl_seconds
            ]
            for sid in expired_ids:
                session = self._sessions.pop(sid, None)
                if session:
                    session.cleanup_files()
                    cleaned_count += 1
        return cleaned_count


session_manager = SessionManager()
