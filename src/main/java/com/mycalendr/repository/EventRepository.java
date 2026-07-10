package com.mycalendr.repository;

import com.mycalendr.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<CalendarEvent, Long> {
}