<template>
  <b-modal body-class="bg-light" size="xl" hide-footer static
           @show="$emit('show')" @hide="$emit('hide')" ref="similarityConfig">
    <template v-slot:modal-header="{close}">
      <h5 class="modal-title">Specification info</h5>

      <button type="button" aria-label="Close" class="ml-auto close modal-header-close" @click="close()">×</button>
    </template>

    <linkset-spec-group-info v-if="type === 'linkset'" :method-group="spec.methods" :add-root-margin="false"/>
    <lens-spec-group-info v-else :elements-group="spec.specs" :add-root-margin="false"/>
  </b-modal>
</template>

<script>
    import LinksetSpecGroupInfo from "@/components/spec/LinksetSpecGroupInfo";
    import LensSpecGroupInfo from "@/components/spec/LensSpecGroupInfo";

    export default {
        name: "SimilarityConfig",
        components: {
            LinksetSpecGroupInfo,
            LensSpecGroupInfo
        },
        props: {
            type: String,
            spec: Object,
        },
        methods: {
            show() {
                this.$refs.similarityConfig.show();
            },
        },
    };
</script>
