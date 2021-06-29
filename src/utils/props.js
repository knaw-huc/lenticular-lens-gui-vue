export default {
    linkPredicates: {
        SKOS: {
            prefix: 'skos',
            uri: 'http://www.w3.org/2004/02/skos/core#',
            predicates: [
                'broadMatch',
                'closeMatch',
                'exactMatch',
                'narrowMatch',
                'relatedMatch',
            ]
        },
        OWL: {
            prefix: 'owl',
            uri: 'http://www.w3.org/2002/07/owl#',
            predicates: [
                'sameAs'
            ]
        },
    },
    tNorms: {
        MINIMUM_T_NORM: 'Minimum t-norm (⊤min)',
        PRODUCT_T_NORM: 'Product t-norm (⊤prod)',
        LUKASIEWICZ_T_NORM: 'Łukasiewicz t-norm (⊤Luk)',
        DRASTIC_T_NORM: 'Drastic t-norm (⊤D)',
        NILPOTENT_MINIMUM: 'Nilpotent minimum (⊤nM)',
        HAMACHER_PRODUCT: 'Hamacher product (⊤H0)',
    },
    tConorms: {
        MAXIMUM_T_CONORM: 'Maximum t-conorm (⊥max)',
        PROBABILISTIC_SUM: 'Probabilistic sum (⊥sum)',
        BOUNDED_SUM: 'Bounded sum (⊥Luk)',
        DRASTIC_T_CONORM: 'Drastic t-conorm (⊥D)',
        NILPOTENT_MAXIMUM: 'Nilpotent maximum (⊥nM)',
        EINSTEIN_SUM: 'Einstein sum (⊥H2)',
    },
    fuzzyLogicOptionGroups: {
        'All conditions must be met (AND)': ['MINIMUM_T_NORM', 'PRODUCT_T_NORM', 'LUKASIEWICZ_T_NORM',
            'DRASTIC_T_NORM', 'NILPOTENT_MINIMUM', 'HAMACHER_PRODUCT'],
        'At least one of the conditions must be met (OR)': ['MAXIMUM_T_CONORM', 'PROBABILISTIC_SUM', 'BOUNDED_SUM',
            'DRASTIC_T_CONORM', 'NILPOTENT_MAXIMUM', 'EINSTEIN_SUM'],
    },
    lensOptions: {
        UNION: 'Union (A ∪ B)',
        INTERSECTION: 'Intersection (A ∩ B)',
        DIFFERENCE: 'Difference (A - B)',
        SYM_DIFFERENCE: 'Symmetric difference (A ∆ B)',
        IN_SET_AND: 'Source and target resources match',
        IN_SET_OR: 'Source or target resources match',
        IN_SET_SOURCE: 'Source resources match',
        IN_SET_TARGET: 'Target resources match'
    },
    lensOptionGroups: {
        'Operations on links': ['UNION', 'INTERSECTION', 'DIFFERENCE', 'SYM_DIFFERENCE'],
        'Operations on link resources': ['IN_SET_AND', 'IN_SET_OR', 'IN_SET_SOURCE', 'IN_SET_TARGET'],
    },
    lensOptionDescriptions: {
        UNION: 'All links of both linksets/lenses',
        INTERSECTION: 'Only links that appear in both linksets/lenses',
        DIFFERENCE: 'Only links from the first linkset/lens, not from the second linkset/lens',
        SYM_DIFFERENCE: 'Only links which appear in either one linkset/lens, but not both',
        IN_SET_AND: 'Both the source and target resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens',
        IN_SET_OR: 'Either the source or the target resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens',
        IN_SET_SOURCE: 'The source resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens',
        IN_SET_TARGET: 'The target resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens'
    },
};