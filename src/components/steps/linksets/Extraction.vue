<template>
  <div class="shadow border bg-primary-light p-3 mt-3">
    <div class="row align-items-center justify-content-between mb-2">
      <div class="col-auto">
        <fa-icon icon="chevron-down" size="lg" v-b-toggle="'extraction_' + _uid"/>
      </div>

      <div class="col-auto mr-auto">
        <div class="input-group-append">
          <div class="btn-group btn-group-toggle">
            <label class="btn btn-secondary btn-sm" v-bind:class="{'active': addAdditionalEts}">
              <input type="checkbox" autocomplete="off" v-model="addAdditionalEts"/>
              Additional entity-type selections
            </label>

            <label class="btn btn-secondary btn-sm" v-bind:class="{'active': useExistingStrength}">
              <input type="checkbox" autocomplete="off" v-model="useExistingStrength"/>
              Extract strength
            </label>
          </div>
        </div>
      </div>

      <div v-if="useFuzzyLogic && useExistingStrength" class="col-auto">
        <select :id="'s_norm_' + _uid" class="form-control form-control-sm" v-model="extraction.s_norm">
          <option v-for="(description, key) in sNorms" :value="key">
            {{ description }}
          </option>
        </select>
      </div>

      <div v-if="useFuzzyLogic && useExistingStrength" class="col-auto">
        <range :id="'threshold_' + _uid" v-model.number="extraction.threshold"
               label="Threshold" :allow-zero="false"/>
      </div>
    </div>

    <b-collapse :id="'extraction_' + _uid" :visible="visible">
      <sub-card label="Sources" size="sm">
        <div class="row pt-3">
          <div class="col">
            <div v-for="(extractionProperty, index) in extraction.sources"
                 class="ml-4 py-2" v-bind:class="{'border-top': index !== 0}">
              <ets-property :entity-type-selection="entityTypeSelection"
                            :property="extractionProperty" :allow-delete="index > 0" :allow-links-only="true"
                            @clone="extraction.sources.splice(index + 1, 0, [''])"
                            @delete="extraction.sources.splice(index, 1)"
                            ref="sourceProperties"/>
            </div>
          </div>
        </div>
      </sub-card>

      <sub-card label="Targets" size="sm">
        <div class="row pt-3">
          <div class="col">
            <div v-for="(extractionProperty, index) in extraction.targets"
                 class="ml-4 py-2" v-bind:class="{'border-top': index !== 0}">
              <ets-property :entity-type-selection="entityTypeSelection"
                            :property="extractionProperty" :allow-delete="index > 0" :allow-links-only="true"
                            @clone="extraction.targets.splice(index + 1, 0, [''])"
                            @delete="extraction.targets.splice(index, 1)"
                            ref="targetProperties"/>
            </div>
          </div>
        </div>
      </sub-card>

      <sub-card v-if="addAdditionalEts" label="Entity-type selections" size="sm" addButton="Add Entity-type Selection"
                @add="extraction.entity_type_selections.push('')">
        <div class="row pt-3 ml-4">
          <div class="col-auto">
            <entity-type-selection
                v-for="(ets, index) in extraction.entity_type_selections"
                :key="index"
                :entity-type-selection="$root.getEntityTypeSelectionById(ets)"
                :selected-ids="extraction.entity_type_selections"
                @input="$set(extraction.entity_type_selections, index, $event); $emit('update')"
                @remove="deleteEntityTypeSelection(index); $emit('update')"
                ref="entityTypeSelections"/>
          </div>
        </div>
      </sub-card>

      <sub-card v-if="useExistingStrength" label="Link strengths" size="sm">
        <div class="row pt-3">
          <div class="col">
            <div v-for="(strengthProperty, index) in extraction.strengths"
                 class="ml-4 py-2" v-bind:class="{'border-top': index !== 0}">
              <ets-property :entity-type-selection="entityTypeSelection" :property="strengthProperty"
                            @clone="extraction.strengths.splice(index + 1, 0, [''])"
                            @delete="deleteStrengthProperty(index)"
                            ref="strengths"/>
            </div>
          </div>
        </div>
      </sub-card>
    </b-collapse>
  </div>
</template>

<script>
    import props from "@/utils/props";
    import ValidationMixin from "@/mixins/ValidationMixin";
    import EntityTypeSelection from "./EntityTypeSelection";

    export default {
        name: "Extraction",
        components: {
            EntityTypeSelection
        },
        mixins: [ValidationMixin],
        props: {
            entityTypeSelection: Object,
            extraction: Object,
            useFuzzyLogic: Boolean,
        },
        data() {
            return {
                visible: true,
                addAdditionalEts: false,
                useExistingStrength: false,
                sNorms: props.sNorms,
            };
        },
        methods: {
            validateExtraction() {
                const sourcePropertiesValid = this.validateField('sources',
                    !this.$refs.sourceProperties
                        .map(prop => prop.validateProperty())
                        .includes(false)
                );

                const targetPropertiesValid = this.validateField('targets',
                    !this.$refs.targetProperties
                        .map(prop => prop.validateProperty())
                        .includes(false)
                );

                const entityTypeSelectionsValid = this.validateField('entityTypeSelections',
                    !this.$refs.entityTypeSelections || !this.$refs.entityTypeSelections
                        .map(entityTypeSelection => entityTypeSelection.validateEntityTypeSelection())
                        .includes(false)
                );

                const strengthsValid = this.validateField('strengths',
                    !this.$refs.strengths || !this.$refs.strengths
                        .map(strength => strength.validateProperty())
                        .includes(false)
                );

                return sourcePropertiesValid && targetPropertiesValid && entityTypeSelectionsValid && strengthsValid;
            },

            deleteEntityTypeSelection(index) {
                this.extraction.entity_type_selections.splice(index, 1);
                if (this.extraction.entity_type_selections.length === 0)
                    this.addAdditionalEts = false;
            },

            deleteStrengthProperty(index) {
                this.extraction.strengths.splice(index, 1);
                if (this.extraction.strengths.length === 0)
                    this.useExistingStrength = false;
            },
        },
        mounted() {
            this.addAdditionalEts = this.extraction.entity_type_selections.length > 0;
            this.useExistingStrength = this.extraction.strengths.length > 0;
        },
        watch: {
            addAdditionalEts() {
                if (this.addAdditionalEts && this.extraction.entity_type_selections.length === 0)
                    this.$set(this.extraction.entity_type_selections, 0, '');
            },

            useExistingStrength() {
                if (this.useExistingStrength && this.extraction.strengths.length === 0)
                    this.$set(this.extraction.strengths, 0, ['']);
            },
        },
    };
</script>