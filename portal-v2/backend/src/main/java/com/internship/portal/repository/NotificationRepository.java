//package com.internship.portal.repository;
//import com.internship.portal.model.Notification;
//import org.springframework.data.jpa.repository.JpaRepository;
//import java.util.List;
//public interface NotificationRepository extends JpaRepository<Notification, Long> {
//    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);
//    long countByUserEmailAndReadFalse(String email);
//    List<Notification> findByUserEmail(String email);
//}





















package com.internship.portal.repository;
import com.internship.portal.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.user.email = :email ORDER BY n.createdAt DESC")
    List<Notification> findByUserEmailOrderByCreatedAtDesc(@Param("email") String email);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.email = :email AND n.read = false")
    long countByUserEmailAndReadFalse(@Param("email") String email);

    @Query("SELECT n FROM Notification n WHERE n.user.email = :email")
    List<Notification> findByUserEmail(@Param("email") String email);
}
