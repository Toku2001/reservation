package io.github.toku2001.reservation.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Reservation {
	private int id;
    private int userId;
    private int itemId;
    private LocalDateTime reservedAt;
}