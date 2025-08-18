package io.github.toku2001.reservation.repository;

import org.apache.ibatis.annotations.Mapper;

import io.github.toku2001.reservation.entity.Reservation;

@Mapper
public interface ReservationMapper {
    int insert(Reservation reservation);
    Reservation findById(Long id);
    int deleteById(Long Id);
}