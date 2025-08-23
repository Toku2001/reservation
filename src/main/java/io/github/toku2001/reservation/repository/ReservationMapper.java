package io.github.toku2001.reservation.repository;

import org.apache.ibatis.annotations.Mapper;

import io.github.toku2001.reservation.entity.Reservation;

@Mapper
public interface ReservationMapper {
    int insert(Reservation reservation);
    Reservation findById(int userId);
    int deleteById(int id, int userId);
    int updateReservation(Reservation reservation);
}