<template>
  <b-modal body-class="bg-light" size="xl" hide-footer static
           @show="$emit('show')" @hide="$emit('hide')" ref="prefixMappings">
    <template v-slot:modal-header="{close}">
      <h5 class="modal-title">Prefix mappings</h5>

      <button class="btn btn-secondary btn-sm ml-auto" @click="saveProperties">
        Save
      </button>

      <button type="button" aria-label="Close" class="close modal-header-close" @click="close()">×</button>
    </template>

    <sub-card label="Metadata prefix mappings" size="xs" :is-first="true">
      <prefix-mapping v-for="(mapping, idx) in metadataMappings"
                      :key="`p${idx}`"
                      :mapping="mapping"
                      :view="view"
                      :is-editing="isEditing === `p${idx}`"
                      :allow-editing="!isEditing"
                      v-bind:class="{'mt-3': idx === 0}"
                      @edit="isEditing = `p${idx}`"
                      @no-edit="isEditing = null"/>
    </sub-card>

    <sub-card label="Alignment prefix mappings" size="xs">
      <prefix-mapping v-for="(mapping, idx) in alignmentMappings"
                      :key="`l${idx}`"
                      :mapping="mapping"
                      :view="view"
                      :is-editing="isEditing === `l${idx}`"
                      v-bind:class="{'mt-3': idx === 0}"
                      @edit="isEditing = `l${idx}`"
                      @no-edit="isEditing = null"/>
    </sub-card>
  </b-modal>
</template>

<script>
    import PrefixMapping from "./PrefixMapping";

    export default {
        name: "PrefixMappings",
        components: {PrefixMapping},
        props: {
            type: String,
            id: Number,
        },
        data() {
            return {
                isEditing: null,
            };
        },
        computed: {
            alignment() {
                return this.type === 'linkset'
                    ? this.$root.linksets.find(linkset => linkset.spec_id === this.id)
                    : this.$root.lenses.find(lens => lens.spec_id === this.id);
            },

            view() {
                return this.$root.getViewByIdAndType(this.id, this.type);
            },

            metadataMappings() {
                const mappings = Object.keys(this.alignment.prefix_mappings).map(prefix => ({
                    prefix,
                    uri: this.alignment.prefix_mappings[prefix],
                    allowUriUpdate: false,
                    viewPrefix: null,
                }));

                this.combineMappingsWithViewMappings(mappings);

                return mappings;
            },

            alignmentMappings() {
                const mappings = Object.keys(this.alignment.uri_prefix_mappings).map(prefix => ({
                    prefix,
                    uri: this.alignment.uri_prefix_mappings[prefix],
                    allowUriUpdate: false,
                })).concat(this.alignment.uri_prefixes.map(uri => ({
                    prefix: '',
                    uri,
                    allowUriUpdate: true,
                })));

                this.combineMappingsWithViewMappings(mappings);

                return mappings;
            },
        },
        methods: {
            show() {
                this.$refs.prefixMappings.show();
            },

            async saveProperties() {
                await this.$root.submit();
                this.$emit('save');
            },

            combineMappingsWithViewMappings(mappings) {
                Object.entries(this.view.prefix_mappings).forEach(([prefix, uri]) => {
                    const mapping = mappings.find(mapping => mapping.prefix === prefix || mapping.uri.startsWith(uri));
                    if (mapping) {
                        mapping.prefix = prefix;
                        if (mapping.allowUriUpdate)
                            mapping.uri = uri;
                    }
                });
            },
        },
    };
</script>
