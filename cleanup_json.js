var fs = require('fs');

fs.readFile('elements.json', function (err, data) {
	if (err) throw err;
	
	var elements = JSON.parse(data);
	for (var i in elements) {
		delete elements[i]["density g/cm"];
		delete elements[i]["melting_point K"];
		delete elements[i]["boiling_point K"];
		delete elements[i]["atomic_radius pm"];
		delete elements[i]["covalent_radius pm"];
		delete elements[i]["ionic_radius pm"];
		delete elements[i]["atomic_volume cm3/mol"];
		delete elements[i]["specific_heat (@20°C J/g mol)"];
		delete elements[i]["fusion_heat (kJ/mol)"];
		delete elements[i]["evaporation_heat (kJ/mol)"];
		delete elements[i]["thermal_conductivity (@25°C W/m K) "];
		delete elements[i]["pauling_negativity"];
		delete elements[i]["first_ionizing kJ/mol"];
		delete elements[i]["oxidation_states"];
		delete elements[i]["electronic_configuration"];
		delete elements[i]["lattice_constant ang"];
		elements[i].name = i;
		elements[i].color = "#C7C8CA";
	}

	fs.writeFile('elements.clean.json', JSON.stringify(elements));
});