package io.github.toku2001.reservation.service.booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import io.github.toku2001.reservation.entity.Reservation;
import io.github.toku2001.reservation.repository.ReservationMapper;

@Service
public class ReservationServiceImpl implements ReservationService {
	
	@Autowired
	private ReservationMapper reservationMapper;

	@Override
	@CachePut(value = "reservationCache", key = "#reservation.id")
	public boolean createBooking(Reservation reservation) {
		int resultNumber = reservationMapper.insert(reservation);
		if(resultNumber == 1) {
			return true;
		}
		return false;
	}
	
	@Override
	@Cacheable(value = "reservationCache", key = "#id")
	public Reservation getReservation(Long id) {
		Reservation reservation = reservationMapper.findById(id);
		return reservation;
	}
	
	@Override
	@CacheEvict(value = "reservationCache", key = "#id")
	public boolean deleteReservation(Long id) {
		int resultNumber = reservationMapper.deleteById(id);
		if(resultNumber == 1) {
			return true;
		}
		return false;
	}
}
