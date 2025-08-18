package io.github.toku2001.reservation.service.booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import io.github.toku2001.reservation.entity.Reservation;
import io.github.toku2001.reservation.repository.ReservationMapper;

@Service
public class ReservationServiceImpl implements ReservationService {
	
	@Autowired
	private ReservationMapper reservationMapper;

	@Override
	public boolean createBooking(Reservation reservation) {
		
		int resultNumber = reservationMapper.insert(reservation);
		if(resultNumber == 1) {
			return true;
		}
		return false;
	}
	
	@Override
	public Reservation getReservation(Long id) {
		Reservation reservation = reservationMapper.findById(id);
		return reservation;
	}
	
	@Override
	public boolean deleteReservation(Long id) {
		int resultNumber = reservationMapper.deleteById(id);
		if(resultNumber == 1) {
			return true;
		}
		return false;
	}
}
