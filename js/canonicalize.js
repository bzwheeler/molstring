var PRIMES = [undefined,2,3,5,7,11,13,17,19,23,29,31,41,43,53,59,61,67,71];

function canonicalize(atoms) {
    var checked_stereochemistry = false;
    
    // rank and sort atoms
    set_initial_rank(atoms);
    atoms.sort(compare_rank);
    reduce(atoms);
    
    while (atoms[atoms.length-1].rank < atoms.length ) {
        apply_ranks(atoms);    
        set_primes(atoms);
        compute_extended_connectivity(atoms);
        sort_by_rank(atoms);
        reduce(atoms);
        
        if (!rank_has_changed(atoms)) {
            if (!checked_stereochemistry) {
                identify_chirals(atoms);
                identify_isomers(atoms);
                checked_stereochemistry = true;
            }
            break_ties(atoms);
            reduce(atoms);
        }
    }
    
    identify_rings(atoms[0], 1);
    reset_search_flags(atoms);

    // print out each string
    console.log(stringify(atoms[0]) + "\n");
}

function set_initial_rank(atoms) {
    for (var atom in atoms) {
        var sign = atom.charge > 0 ? 1 : 0;
        atom.rank = atom.connections 
            + atoms.non_h_bonds 
            + atoms.number 
            + sign 
            + atom.charge 
            + atom.hydrogens;
    }
    
    return atoms;
}

function sort_by_rank(atoms) {
    var sorted   = [],
        subset   = [],
        previous = -1;
    
    for (var i = 0; i < atoms.length; i++) {
        if (atoms[i].previous_rank != previous ) {
            previous = atoms[i].previous_rank;
            if (subset.length) {
                // sort subset and add to sorted
                sorted.push(subset.sort(compare_rank));
            }
            subset = [];
        }
        
        subset.push(atoms[i]);
    }
    
    if (subset.length) {
        sorted.push(subset.sort(compare_rank));       
    }
    
    atoms = sorted;
    return atoms;
}

function reduce(atoms) {
    var previous = -1,
        rank     = -1,
        reduced  = 0;

    for (var i = 0; i < atoms.length; i++) {
        var atom = atoms[i];
        if ((atom.previous_rank && atom.previous_rank != previous) || atom.rank != rank) {
            previous = atom.previous_rank;
            rank     = atom.rank;
            reduced++;
        }

        atom.rank = reduced;
    }
    
    //my @ordered = sort { $a->{id} <=> $b->{id} } @$atoms;
    //my @ranks   = map { $_->{rank} } @ordered;
    //print join(',', @ranks) . "\n";
    
    return atoms;
}

function set_primes(atoms) {
    for (var i = atoms.length; --i >= 0;) {
        var atom = atoms[i];
        atom.prime = PRIMES[atom.rank];
    }
    
    return atoms;
}

function compute_extended_connectivity(atoms) {
    for (var i = atoms.length; --i >= 0;) {
        var atom = atoms[i];
        var product = 1;

        for (var j = atom.bonds.length; --j >= 0;) {
            product *= atom.bonds[j].prime;
        }

        atom.rank = product;
    }
    
    return atoms;    
}

function rank_has_changed(atoms) {
    var changed = false;

    for (var i = atoms.length; --i >= 0;) {
        var atom = atoms[i];
        if ( atom.previous_rank != atom.rank ) {
            changed = true;
            break;
        }
    }
    
    return changed;
}

function break_ties(atoms) {
    var previous = -1,
        broken   = false;
    
    for (var i = 0; i < atoms.length; i++) {
        var atom = atoms[i];
        atom.rank *= 2;

        if (!broken && atom.rank == previous) {
            broken = true;
            atoms[i-1].rank -= 1;
        }

        previous = atom.rank;
    }
    
    return atoms;
}

function apply_ranks(atoms) {
    for (var i = 0; i < atoms.length; i++) {
        var atom = atoms[i];
        atom.previous_rank = atom.rank;
    }
    
    return atoms;
}

function compare_rank(a, b) {
    if (a.rank < b.rank) {
        return -1;
    }
    if (a.rank > b.rank) {
        return 1;
    }

    return 0;
}

function reset_search_flags(atoms) {
    for (var i = atoms.length; --i >= 0;) {
        atoms[i].seen = 0;
    }
    
    return;
}

function identify_chirals(atoms) {
    for (var i = 0; i < atoms.length; i++) {
        var atom = atoms[i];
        // must be a carbon
        if (atom.number != 6) continue;
        // must have 4 bonded atoms
        if (!(atom.bonds.length == 4 || atom.bonds.length == 3 && atom.hydrogens == 1)) continue;
        
        var rankings = {},
            rank_count = 0;

        for (var i = atom.bonds.length; --i >= 0;) {
            var bonded = atom.bonds[i];
            if (!ranking[bonded.rank]) {
                ranking[bonded.rank] = 1;
                rank_count++;
            }
        }
        
        // all bonded atoms ( or groups of atoms ) must be different
        if (rank_count != atom.bonds.length) continue;
        
        // we are chiral!!
        atom.chirality = '@';
    }

    return;
}

function identify_isomers(atoms) {
    return;
}

function identify_rings(node, ring_count, previous) {
    var sorted = node.bonds.sort(compare_rank);

    node.seen = 1;
    
    for (var i = 0; i < sorted.length; i++) {
        if (previous && sorted[i].seen && sorted[i].id != previous.id) {
            if (!has_matching_ring(node.rings, ring_count)) {
                node.rings.push(ring_count);
                sorted[i].rings.push(ring_count);
                ring_count++;
            }
        }
        
        if (sorted[i].seen) continue;
        
        identify_rings(sorted[i], ring_count, node);
    }
    
    return;
}

function has_matching_ring(ring_list, ring_identifier) {
    for (var i = ring_list.length; --i >= 0;) {
        if (ring_list[i] == ring_identifier) {
            return true;
        }
    }

    return false;
}

function stringify(node) {
    var sorted = node.bonds.sort(compare_rank);
    var smiles = node.symbol;
    
    if (node.chirality) smiles += node.chirality;
    if (node.rings)     smiles += node.rings.join(',');
    
    node.seen = 1;
    
    for (var i = 0; i < sorted.length; i++) {
        if (sorted[i].seen) continue;
        
        var bonded_smiles = stringify(sorted[i]);
        if (unseen_count(sorted)) {
            bonded_smiles = '(' + bonded_smiles + ')';
        }
        
        smiles += bonded_smiles;
    }
    
    return smiles;
}

function unseen_count(atoms) {
    var unseen = 0;
    for(var i = atoms.length; --i >= 0; ) {
        if (!atoms[i].seen) {
            unseen += 1;
        }
    }
    
    return unseen;
}