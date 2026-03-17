package com.internship.portal.repository;

import com.internship.portal.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByRoomIdOrderBySentAtAsc(String roomId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiverEmail = :email AND m.read = false")
    long countUnreadByReceiver(@Param("email") String email);

    @Query("SELECT DISTINCT m.roomId FROM ChatMessage m WHERE m.senderEmail = :email OR m.receiverEmail = :email")
    List<String> findRoomsByEmail(@Param("email") String email);

    List<ChatMessage> findByReceiverEmailAndReadFalse(String email);
}
