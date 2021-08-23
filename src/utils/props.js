export default {
    linkPredicates: {
        skos: {
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
        owl: {
            prefix: 'owl',
            uri: 'http://www.w3.org/2002/07/owl#',
            predicates: [
                'sameAs'
            ]
        },
    },
    tNorms: {
        minimum_t_norm: 'Minimum t-norm (⊤min)',
        product_t_norm: 'Product t-norm (⊤prod)',
        lukasiewicz_t_norm: 'Łukasiewicz t-norm (⊤Luk)',
        drastic_t_norm: 'Drastic t-norm (⊤D)',
        nilpotent_minimum: 'Nilpotent minimum (⊤nM)',
        hamacher_product: 'Hamacher product (⊤H0)',
    },
    sNorms: {
        maximum_s_norm: 'Maximum s-norm (⊥max)',
        probabilistic_sum: 'Probabilistic sum (⊥sum)',
        bounded_sum: 'Bounded sum (⊥Luk)',
        drastic_s_norm: 'Drastic s-norm (⊥D)',
        nilpotent_maximum: 'Nilpotent maximum (⊥nM)',
        einstein_sum: 'Einstein sum (⊥H2)',
    },
    fuzzyLogicOptionGroups: {
        'All conditions must be met (AND)': ['minimum_t_norm', 'product_t_norm', 'lukasiewicz_t_norm',
            'drastic_t_norm', 'nilpotent_minimum', 'hamacher_product'],
        'At least one of the conditions must be met (OR)': ['maximum_s_norm', 'probabilistic_sum', 'bounded_sum',
            'drastic_s_norm', 'nilpotent_maximum', 'einstein_sum'],
    },
    lensOptions: {
        union: 'Union (A ∪ B)',
        intersection: 'Intersection (A ∩ B)',
        difference: 'Difference (A - B)',
        sym_difference: 'Symmetric difference (A ∆ B)',
        in_set_and: 'Source and target resources match',
        in_set_or: 'Source or target resources match',
        in_set_source: 'Source resources match',
        in_set_target: 'Target resources match'
    },
    lensOptionGroups: {
        'Operations on links': ['union', 'intersection', 'difference', 'sym_difference'],
        'Operations on link resources': ['in_set_and', 'in_set_or', 'in_set_source', 'in_set_target'],
    },
    lensOptionDescriptions: {
        union: 'All links of both linksets/lenses',
        intersection: 'Only links that appear in both linksets/lenses',
        difference: 'Only links from the first linkset/lens, not from the second linkset/lens',
        sym_difference: 'Only links which appear in either one linkset/lens, but not both',
        in_set_and: 'Both the source and target resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens',
        in_set_or: 'Either the source or the target resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens',
        in_set_source: 'The source resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens',
        in_set_target: 'The target resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens'
    },
};