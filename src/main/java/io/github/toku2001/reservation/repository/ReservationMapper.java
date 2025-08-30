package io.github.toku2001.reservation.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import io.github.toku2001.reservation.entity.Reservation;

@Mapper
public interface ReservationMapper {
    int insert(Reservation reservation);
    Reservation findById(int id);
    List<Reservation> findByUserId(int userId);
    int deleteById(int id, int userId);
    int updateReservation(Reservation reservation);
    
    //負荷テスト用に作成
    int createTestReservation(Reservation reservation);
    int createTestUsers(int userId);
    Reservation getOlderUsers();
}