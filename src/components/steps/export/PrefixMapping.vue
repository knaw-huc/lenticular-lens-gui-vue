<template>
  <div class="row my-1 align-items-center">
    <div class="col-3">
      <input v-if="isEditing" class="form-control form-control-sm" type="text"
             v-model="prefix" placeholder="Enter a prefix"/>
      <span v-else class="text-secondary">{{ mapping.prefix }}</span>
    </div>

    <div class="col-7 text-break">
      <input v-if="mapping.allowUriUpdate && isEditing" class="form-control form-control-sm" type="text"
             v-model="uri" placeholder="Enter an uri"/>
      <span v-else>{{ mapping.uri }}</span>
    </div>

    <div class="col-auto ml-auto">
      <template v-if="isEditing">
        <button class="btn btn-sm text-secondary" @click="save">
          <fa-icon icon="check"/>
        </button>

        <button class="btn btn-sm text-secondary" @click="$emit('no-edit')">
          <fa-icon icon="ban"/>
        </button>
      </template>

      <button v-else class="btn btn-sm text-secondary" @click="$emit('edit')">
        <fa-icon icon="pencil-alt"/>
      </button>
    </div>
  </div>
</template>

<script>
    export default {
        name: "PrefixMapping",
        props: {
            mapping: Object,
            view: Object,
            isEditing: Boolean,
        },
        data() {
            return {
                prefix: null,
                uri: null,
            };
        },
        methods: {
            save() {
                if (this.mapping.prefix !== this.prefix || this.mapping.uri !== this.uri) {
                    if (this.view.prefix_mappings.hasOwnProperty(this.mapping.prefix))
                        this.$delete(this.view.prefix_mappings, this.mapping.prefix);

                    if (this.prefix)
                        this.$set(this.view.prefix_mappings, this.prefix, this.uri);
                }

                this.$emit('no-edit');
            },
        },
        mounted() {
            this.prefix = this.mapping.prefix;
            this.uri = this.mapping.uri;
        },
        watch: {
            isEditing() {
                this.prefix = this.mapping.prefix;
                this.uri = this.mapping.uri;
            },

            mapping() {
                this.prefix = this.mapping.prefix;
                this.uri = this.mapping.uri;
            },
        },
    };
</script>
