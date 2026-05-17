package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.PagoDuelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PagoDueloRepository extends JpaRepository<PagoDuelo, Integer> {
  List<PagoDuelo> findByDuelo_DueloId(Integer dueloId);
}
