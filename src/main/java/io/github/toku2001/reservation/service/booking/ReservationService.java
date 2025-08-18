package io.github.toku2001.reservation.service.booking;

import io.github.toku2001.reservation.entity.Reservation;

public interface ReservationService {
	boolean createBooking(Reservation reservation);
	Reservation getReservation(Long id);
	boolean deleteReservation(Long id);
}
