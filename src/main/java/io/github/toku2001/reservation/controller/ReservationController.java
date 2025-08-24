package io.github.toku2001.reservation.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.toku2001.reservation.entity.Reservation;
import io.github.toku2001.reservation.service.booking.ReservationService;

@RestController
@RequestMapping("/reservation")
public class ReservationController {
	
	@Autowired
    private  ReservationService reservationService;
    
    @PostMapping("/booking")
    public String createBooking(@RequestBody Reservation reservation) {
    	reservationService.createBooking(reservation);
        return "Reservation created!";
    }

    @GetMapping("/{userId}")
    public List<Reservation> get(@PathVariable int userId) {
        return reservationService.getReservation(userId);
    }
    
    @DeleteMapping("/{id}/{userId}")
    public boolean deleteById(@PathVariable int id, @PathVariable int userId) {
        return reservationService.deleteReservation(id, userId);
    }
    
    @PutMapping("/update-booking")
    public String updateReservation(@RequestBody Reservation reservation) {
    	reservationService.updateReservation(reservation);
    	return "Reservation updated!";
    }
}