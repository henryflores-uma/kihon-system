package com.kihon.kihon;

import com.kihon.kihon.service.AsistenciaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class KihonApplicationTests {

	@Autowired
	private AsistenciaService asistenciaService;

	@Test
	void contextoSpringCargaCorrectamente() {

		assertNotNull(asistenciaService);
	}
}