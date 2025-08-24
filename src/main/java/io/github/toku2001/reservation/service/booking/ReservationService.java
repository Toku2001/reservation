package io.github.toku2001.reservation.service.booking;

import java.util.List;

import io.github.toku2001.reservation.entity.Reservation;

public interface ReservationService {
	boolean createBooking(Reservation reservation);
	List<Reservation> getReservation(int userId);
	boolean deleteReservation(int id, int userId);
	boolean updateReservation(Reservation reservation);
}
