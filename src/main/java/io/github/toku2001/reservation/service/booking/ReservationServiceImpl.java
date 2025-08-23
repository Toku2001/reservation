package io.github.toku2001.reservation.service.booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import io.github.toku2001.reservation.entity.Reservation;
import io.github.toku2001.reservation.repository.ReservationMapper;

@Service
public class ReservationServiceImpl implements ReservationService {
	
	@Autowired
	private ReservationMapper reservationMapper;
	
	@Autowired
	private CacheManager cacheManager;

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
	@Cacheable(value = "reservationCache", key = "#userId")
	public Reservation getReservation(int userId) {
		System.out.println(">>> DBアクセス発生: getReservation(" + userId + ")");
		Reservation reservation = reservationMapper.findById(userId);
		return reservation;
	}
	
	@Override
	@CacheEvict(value = "reservationCache", key = "#userId")
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
			//MyBatisではアップデート文の戻り値を更新行にすることはできないため改め更新行を取得
			System.out.println(">>> DBアクセス発生: getReservation(" + reservation.getId() + ")");
			Reservation updated = reservationMapper.findById(reservation.getId());
			cacheManager.getCache("reservationCache").put(updated.getUserId(), updated);
			return true;
		}
		return false;
	}
}
