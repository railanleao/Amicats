package org.amicats.backend.repository.cat;

import org.amicats.backend.domain.entity.Cat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatRepository extends JpaRepository<Cat, Integer> {}
