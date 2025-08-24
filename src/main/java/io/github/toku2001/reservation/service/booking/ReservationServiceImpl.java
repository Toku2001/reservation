package io.github.toku2001.reservation.service.booking;

import java.util.List;

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
		System.out.println(">>> DBアクセス発生: createBooking(" + reservation.getId() + ")");
		int resultNumber = reservationMapper.insert(reservation);
		if(resultNumber == 1) {
			return true;
		}
		return false;
	}
	
	@Override
	public List<Reservation> getReservation(int userId) {
		System.out.println(">>> DBアクセス発生: getReservation(" + userId + ")");
		List<Reservation> reservation = reservationMapper.findByUserId(userId);
		return reservation;
	}
	
	@Override
	public boolean deleteReservation(int id, int userId) {
		System.out.println(">>> DBアクセス発生: deleteReservation(" + id + ")(" + userId + ")");
		int resultNumber = reservationMapper.deleteById(id, userId);
		if(resultNumber == 1) {
			return true;
		}
		return false;
	}
	
	@Override
	public boolean updateReservation(Reservation reservation) {
		System.out.println(">>> DBアクセス発生: updateReservation(" + reservation.getId() + ")");
		int resultNumber = reservationMapper.updateReservation(reservation);
		if(resultNumber == 1) {
			return true;
		}
		return false;
	}
}
