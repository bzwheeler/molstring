#!/user/bin/perl
use strict;
use warnings;
use List::MoreUtils qw/any/;

our @PRIMES = (undef,2,3,5,7,11,13,17,19,23,29,31,41,43,53,59,61,67,71);

sub canonicalize {
    my $atoms = shift;
    my $checked_stereochemistry = 0;
    set_initial_rank( $atoms );
    $atoms = [sort compare_rank @$atoms];
    reduce( $atoms );
    
    while ( $atoms->[-1]->{rank} < @$atoms ) {
        apply_ranks( $atoms );    
        set_primes( $atoms );
        compute_extended_connectivity( $atoms );
        sort_by_rank( $atoms );
        reduce( $atoms );
        
        if( !rank_has_changed( $atoms ) ) {
            if ( !$checked_stereochemistry ) {
                identify_chirals( $atoms );
                identify_isomers( $atoms );
                $checked_stereochemistry = 1;
            }
            break_ties( $atoms );
            reduce( $atoms );
        }
    }
    
    identify_rings( $atoms->[0], 1 );
    reset_search_flags( $atoms );
    print stringify( $atoms->[0] ) . "\n";
}

sub set_initial_rank {
    my $atoms = shift;
    
    foreach my $atom ( @$atoms ) {
        my $atomic_number = $atom->{number};
        my $connections   = $atom->{connections};
        my $non_h_bonds   = $atom->{non_h_bonds};    
        my $sign          = ($atom->{charge} > 0) ? 1 : 0;
        my $charge        = $atom->{charge};
        my $hydrogens     = $atom->{hydrogens};
        $atom->{rank}     = $connections . $non_h_bonds . $atomic_number . $sign . $charge . $hydrogens;
    }
    
    return $atoms;
}

sub sort_by_rank {
    my $atoms    = shift;
    my @sorted   = ();
    my @subset   = ();
    my $previous = -1;
    
    for( my $i = 0; $i < @$atoms; $i++ ) {
        if ( $atoms->[$i]->{previous_rank} != $previous ) {
            $previous = $atoms->[$i]->{previous_rank};
            if ( scalar @subset ) {
                push @sorted, sort compare_rank @subset;
            }
            @subset = ();
        }
        
        push @subset, $atoms->[$i];
    }
    
    if ( scalar @subset ) {
        push @sorted, sort compare_rank @subset;        
    }
    
    @$atoms = @sorted;
    
    return $atoms;
}

sub reduce {
    my $atoms    = shift;
    my $previous = -1;
    my $rank     = -1;
    my $reduced  = 0;
    for( my $i = 0; $i < @$atoms; $i++ ) {
        if ( ($atoms->[$i]->{previous_rank} && $atoms->[$i]->{previous_rank} != $previous) || $atoms->[$i]->{rank} != $rank ) {
            $previous = $atoms->[$i]->{previous_rank};
            $rank     = $atoms->[$i]->{rank};
            $reduced++;
        }
        $atoms->[$i]->{rank} = $reduced;
    }
    
    my @ordered = sort { $a->{id} <=> $b->{id} } @$atoms;
    my @ranks   = map { $_->{rank} } @ordered;
    print join(',', @ranks) . "\n";
    
    return $atoms;
}

sub set_primes {
    my $atoms = shift;
    foreach my $atom ( @$atoms ) {
        $atom->{prime} = $PRIMES[$atom->{rank}];
    }
    
    return $atoms
}

sub compute_extended_connectivity {
    my $atoms = shift;
    foreach my $atom( @$atoms ) {
        my $product = 1;
        foreach my $bonded ( @{$atom->{bonds}} ) {
            $product *= $bonded->{prime};
        }
        $atom->{rank} = $product;
    }
    
    return $atoms;    
}

sub rank_has_changed {
    my $atoms = shift;
    my $changed = 0;
    foreach my $atom ( @$atoms ) {
        if ( $atom->{previous_rank} != $atom->{rank} ) {
            $changed = 1;
            last;
        }
    }
    
    return $changed;
}

sub break_ties {
    my $atoms    = shift;
    my $previous = -1;
    my $broken   = 0;
    
    for( my $i = 0; $i < @$atoms; $i++ ) {
        $atoms->[$i]->{rank} *= 2;
        if( !$broken && $atoms->[$i]->{rank} == $previous ) {
            $broken = 1;
            $atoms->[$i-1]->{rank} -= 1;
        }
        $previous = $atoms->[$i]->{rank};
    }
    
    return $atoms;
}

sub apply_ranks {
    my $atoms = shift;
    
    for ( my $i = 0; $i < @$atoms; $i++ ) {
        my $atom = $atoms->[$i];
        $atom->{previous_rank} = $atom->{rank};
    }
    
    return $atoms;
}

sub compare_rank {
    return $a->{rank} <=> $b->{rank};
}

sub reset_search_flags {
    my $atoms = shift;
    foreach my $atom ( @$atoms ) {
        $atom->{seen} = 0;
    }
    
    return;
}

sub identify_chirals {
    my $atoms = shift;
    foreach my $atom ( @$atoms ) {
        # must be a carbon
        next unless $atom->{number} == 6;
        # must have 4 bonded atoms
        next unless scalar @{$atom->{bonds}} == 4 || scalar @{$atom->{bonds}} == 3 && $atom->{hydrogens} == 1;
        my $rankings = {};
        for my $bonded ( @{$atom->{bonds}} ) {
            $rankings->{$bonded->{rank}} = 1;
        }
        # all bonded atoms ( or groups of atoms ) must be different
        next unless scalar keys %{$rankings} == scalar @{$atom->{bonds}};
        # we are chiral!!
        $atom->{chirality} = '@';
    }
    return;
}

sub identify_isomers {
    my $atoms = shift;
    return;
}

sub identify_rings {
    my ($node, $ring_count, $previous) = @_;
    my @sorted = sort compare_rank @{$node->{bonds}};
    $node->{seen} = 1;
    
    for( my $i = 0; $i < @sorted; $i++ ) {
        if ( $previous && $sorted[$i]->{seen} && $sorted[$i]->{id} != $previous->{id} ) {
            if ( !any { $_ == $ring_count} @{$node->{rings}} ) {
                push @{$node->{rings}}, $ring_count;
                push @{$sorted[$i]->{rings}}, $ring_count;
                $ring_count++;
            }
        }
        
        next if $sorted[$i]->{seen};
        
        identify_rings( $sorted[$i], $ring_count, $node );
    }
    
    return;
}

sub stringify {
    my ($node) = @_;
    my @sorted = sort compare_rank @{$node->{bonds}};
    my $smiles = $node->{symbol};
    
    $smiles .= $node->{chirality} if $node->{chirality};
    $smiles .= join ',', @{$node->{rings}} if $node->{rings};
    
    $node->{seen} = 1;
    
    for( my $i = 0; $i < @sorted; $i++ ) {
        next if $sorted[$i]->{seen};
        
        my $bonded_smiles = stringify( $sorted[$i] );
        if ( unseen_count( \@sorted ) ) {
            $bonded_smiles = '(' . $bonded_smiles . ')';
        }
        
        $smiles .= $bonded_smiles;
    }
    
    return $smiles;
}

sub unseen_count {
    my $atoms = shift;
    my $unseen = 0;
    foreach my $atom ( @$atoms ) {
        $unseen += 1 unless $atom->{seen};
    }
    
    return $unseen;
}