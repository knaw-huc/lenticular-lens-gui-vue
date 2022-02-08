<template>
  <card :id="'linkset_spec_' + linksetSpec.id" type="linkset_specs" :res-id="linksetSpec.id" v-model="linksetSpec.label"
        :has-error="errors.length > 0" :has-handle="true" :has-extra-row="!!linkset"
        @show="onToggle(true)" @hide="onToggle(false)">
    <template v-slot:title-columns>
      <div v-if="!linkset" class="col-auto">
        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'use_counter_' + linksetSpec.id" v-model="linksetSpec.use_counter"/>
          <label class="custom-control-label" :for="'use_counter_' + linksetSpec.id"
                 title="Matching could potentially run faster if progress tracking is disabled">
            Show matching progress
          </label>
        </div>
      </div>

      <div v-if="!isOpen" class="col-auto">
        <button class="btn btn-secondary" @click="$emit('duplicate', linksetSpec)">Duplicate</button>
      </div>

      <div v-if="linksetStatus === 'downloading' || linksetStatus === 'running'" class="col-auto">
        <button class="btn btn-danger" @click="killLinkset">Stop</button>
      </div>

      <div v-if="clusteringStatus === 'running'" class="col-auto">
        <button class="btn btn-danger" @click="killClustering">Stop</button>
      </div>

      <div v-if="!linkset || linksetStatus === 'failed'" class="col-auto">
        <button class="btn btn-secondary" @click="runLinkset()">
          Run
          <template v-if="linksetStatus === 'failed'">again</template>
        </button>
      </div>

      <div
          v-if="linksetStatus === 'done' && linkset.links_count > 0 && (!clustering || clusteringStatus === 'failed')"
          class="col-auto">
        <button type="button" class="btn btn-secondary my-1" @click="runClustering($event)">
          Cluster
          <template v-if="clusteringStatus === 'failed'">again</template>
        </button>
      </div>

      <div v-if="!isOpen" class="col-auto">
        <button-delete @click="$emit('remove')" title="Delete this linkset" :disabled="!allowDelete"/>
      </div>
    </template>

    <template v-slot:columns>
      <div v-if="linkset" class="col">
        <status :linkset-spec="linksetSpec"/>
      </div>
    </template>

    <sub-card label="Description">
      <textarea class="form-control mt-3" :id="'description_' + linksetSpec.id" v-model="linksetSpec.description">
      </textarea>

      <small class="form-text text-muted mt-2">
        Provide a description for this linkset
      </small>
    </sub-card>

    <sub-card label="Matching">
      <div class="custom-control custom-switch mt-3">
        <input type="radio" class="custom-control-input" autocomplete="off" :id="'matching_extract_' + linksetSpec.id"
               value="extract" v-model="linksetSpec.matching" @change="updateType"/>
        <label class="custom-control-label" :for="'matching_extract_' + linksetSpec.id">
          Extract existing links
        </label>
      </div>

      <div class="custom-control custom-switch">
        <input type="radio" class="custom-control-input" autocomplete="off" :id="'matching_methods_' + linksetSpec.id"
               value="methods" v-model="linksetSpec.matching" @change="updateType"/>
        <label class="custom-control-label" :for="'matching_methods_' + linksetSpec.id">
          Find links using matching methods
        </label>
      </div>
    </sub-card>

    <fieldset :disabled="!!linkset">
      <sub-card v-if="linksetSpec.matching !== ''" label="Sources" :has-info="true"
                add-button="Add an Entity-type Selection as a Source"
                :hasError="errors.includes('sources') || errors.includes('sources_select')"
                @add="addEntityTypeSelection('sources')">
        <template v-slot:info>
          <linkset-spec-sources-info/>
        </template>

        <div class="row pl-5 mt-2">
          <div class="col">
            <entity-type-selection
                v-for="(source, index) in linksetSpec.sources"
                :key="index"
                :entity-type-selection="$root.getEntityTypeSelectionById(source)"
                :selected-ids="linksetSpec.sources"
                @input="updateEntityTypeSelection('sources', index, $event)"
                @remove="updateEntityTypeSelection('sources', index)"
                ref="sourceComponents"/>

            <div class="invalid-feedback" v-bind:class="{'is-invalid': errors.includes('sources')}">
              Please provide at least one source
            </div>
          </div>
        </div>
      </sub-card>

      <sub-card v-if="linksetSpec.matching === 'methods'" label="Targets" :has-info="true"
                add-button="Add an Entity-type Selection as a Target"
                :hasError="errors.includes('targets') || errors.includes('targets_select')"
                @add="addEntityTypeSelection('targets', $event)">
        <template v-slot:info>
          <linkset-spec-targets-info/>
        </template>

        <div class="row pl-5 mt-2">
          <div class="col">
            <entity-type-selection
                v-for="(target, index) in linksetSpec.targets"
                :key="index"
                :entity-type-selection="$root.getEntityTypeSelectionById(target)"
                :selected-ids="linksetSpec.targets"
                @input="updateEntityTypeSelection('targets', index, $event)"
                @remove="updateEntityTypeSelection('targets', index)"
                ref="targetComponents"/>

            <div class="invalid-feedback" v-bind:class="{'is-invalid': errors.includes('targets')}">
              Please provide at least one target
            </div>
          </div>
        </div>
      </sub-card>

      <sub-card v-if="linksetSpec.matching === 'extract'" label="Existing links" :hasError="errors.includes('extract')">
        <template v-slot:columns>
          <div class="col-auto">
            <div class="custom-control custom-switch">
              <input type="checkbox" class="custom-control-input" autocomplete="off"
                     :id="'fuzzy_linkset_' + linksetSpec.id" v-model="useFuzzyLogic"/>
              <label class="custom-control-label" :for="'fuzzy_linkset_' + linksetSpec.id">Use fuzzy logic</label>
            </div>
          </div>
        </template>

        <div class="position-relative shadow border bg-secondary-light p-3 mt-3"
             v-bind:class="[{'is-invalid': errors.includes('extract')}]">
          <div class="row align-items-center">
            <div class="col-auto">
              <fa-icon icon="chevron-down" size="lg" v-b-toggle="'extraction_' + _uid"></fa-icon>
            </div>

            <template
                v-if="useFuzzyLogic && Object.values(linksetSpec.extract.elements).find(el => el.strengths.length > 0)">
              <div class="col">
                <select :id="'extract_s_norm_' + _uid" class="form-control form-control-sm"
                        v-model="linksetSpec.extract.s_norm">
                  <option v-for="(description, key) in allSNorms" :value="key">
                    {{ description }}
                  </option>
                </select>
              </div>

              <div class="col-auto">
                <range :id="'extract_threshold_' + _uid" v-model.number="linksetSpec.extract.threshold"
                       label="Threshold" :allow-zero="false"/>
              </div>
            </template>
          </div>

          <b-collapse visible :id="'extraction_' + _uid" :ref="'extraction_' + _uid">
            <extraction v-for="(extraction, etsId) in linksetSpec.extract.elements"
                        :key="etsId"
                        :entity-type-selection="$root.getEntityTypeSelectionById(etsId)"
                        :extraction="extraction"
                        :use-fuzzy-logic="useFuzzyLogic"
                        @update="updateView"
                        ref="extractions"/>
          </b-collapse>
        </div>
      </sub-card>

      <sub-card v-if="linksetSpec.matching === 'methods'" label="Matching Methods" :has-columns="true"
                :hasError="errors.includes('matching_methods')">
        <template v-slot:columns>
          <div class="col-auto">
            <div class="custom-control custom-switch">
              <input type="checkbox" class="custom-control-input" autocomplete="off"
                     :id="'fuzzy_linkset_' + linksetSpec.id" v-model="useFuzzyLogic"/>
              <label class="custom-control-label" :for="'fuzzy_linkset_' + linksetSpec.id">Use fuzzy logic</label>
            </div>
          </div>
        </template>

        <logic-box :element="linksetSpec.methods" elements-name="conditions" :is-root="true"
                   :should-have-elements="true" :group="'linkset-filters' + linksetSpec.id"
                   :uid="'linkset_' + linksetSpec.id  + '_0'"
                   :options="useFuzzyLogic ? fuzzyLogicOptions : undefined"
                   :option-groups="useFuzzyLogic ? fuzzyLogicOptionGroups : undefined"
                   validate-method-name="validateCondition" empty-elements-text="No conditions"
                   validation-failed-text="Please provide at least one condition"
                   @add="addCondition($event)" ref="matchingMethodGroupComponent">
          <template v-slot:box-slot="boxElement">
            <div v-if="useFuzzyLogic" class="col-auto">
              <range :id="'threshold_' + boxElement.index" v-model.number="boxElement.element.threshold"
                     label="Threshold" :allow-zero="false"/>
            </div>
          </template>

          <template v-slot="curCondition">
            <condition :condition="curCondition.element" :id="curCondition.uid"
                       :use-fuzzy-logic="useFuzzyLogic" @add="curCondition.add()" @remove="curCondition.remove()"/>
          </template>
        </logic-box>
      </sub-card>
    </fieldset>
  </card>
</template>

<script>
    import props from "@/utils/props";
    import LogicBox from "@/components/helpers/LogicBox";
    import ValidationMixin from '@/mixins/ValidationMixin';

    import LinksetSpecSourcesInfo from '@/components/info/LinksetSpecSourcesInfo';
    import LinksetSpecTargetsInfo from '@/components/info/LinksetSpecTargetsInfo';
    import MatchingMethodsInfo from '@/components/info/MatchingMethodsInfo';

    import Status from "./Status";
    import Condition from "./Condition";
    import Extraction from "./Extraction";
    import EntityTypeSelection from "./EntityTypeSelection";

    export default {
        name: "Linkset",
        mixins: [ValidationMixin],
        components: {
            LinksetSpecSourcesInfo,
            LinksetSpecTargetsInfo,
            MatchingMethodsInfo,
            Status,
            EntityTypeSelection,
            Condition,
            Extraction,
            LogicBox
        },
        props: {
            linksetSpec: Object,
            allowDelete: Boolean,
        },
        data() {
            return {
                isOpen: false,
                useFuzzyLogic: false,
                tNorms: Object.keys(props.tNorms),
                sNorms: Object.keys(props.sNorms),
                allSNorms: props.sNorms,
                fuzzyLogicOptions: {...props.tNorms, ...props.sNorms},
                fuzzyLogicOptionGroups: props.fuzzyLogicOptionGroups,
            };
        },
        computed: {
            view() {
                return this.$root.getViewByIdAndType(this.linksetSpec.id, 'linkset');
            },

            linkset() {
                return this.$root.linksets.find(linkset => linkset.spec_id === this.linksetSpec.id);
            },

            clustering() {
                return this.$root.clusterings.find(clustering =>
                    clustering.spec_type === 'linkset' && clustering.spec_id === this.linksetSpec.id);
            },

            linksetStatus() {
                return this.linkset ? this.linkset.status : null;
            },

            clusteringStatus() {
                return this.clustering ? this.clustering.status : null;
            },
        },
        methods: {
            validateLinkset() {
                const sourcesValid = this.validateField('sources', this.linksetSpec.sources.length > 0);
                const sourcesSelectValid = this.validateField('sources_select',
                    !this.$refs.sourceComponents
                        .map(sourceComponent => sourceComponent.validateEntityTypeSelection())
                        .includes(false)
                );

                let targetsValid = true;
                let targetsSelectValid = true;
                let matchingMethodGroupValid = true;
                if (this.linksetSpec.matching === 'methods') {
                    targetsValid = this.validateField('targets', this.linksetSpec.targets.length > 0);
                    targetsSelectValid = this.validateField('targets_select',
                        !this.$refs.targetComponents
                            .map(targetComponent => targetComponent.validateEntityTypeSelection())
                            .includes(false)
                    );

                    if (this.$refs.matchingMethodGroupComponent)
                        matchingMethodGroupValid = this.$refs.matchingMethodGroupComponent.validateLogicBox();
                    matchingMethodGroupValid = this.validateField('matching_methods', matchingMethodGroupValid);
                }

                const extractionsValid = this.linksetSpec.matching === 'extract'
                    ? this.validateField('extract',
                        !this.$refs.extractions || !this.$refs.extractions
                            .map(extraction => extraction.validateExtraction())
                            .includes(false)
                    ) : true;

                return sourcesValid && sourcesSelectValid && targetsValid && targetsSelectValid
                    && matchingMethodGroupValid && extractionsValid;
            },

            onToggle(isOpen) {
                this.isOpen = isOpen;
                isOpen ? this.$emit('show') : this.$emit('hide');
            },

            addCondition(group) {
                group.conditions.push({
                    method: {
                        name: '',
                        config: {},
                    },
                    sim_method: {
                        name: null,
                        config: {},
                        normalized: false,
                    },
                    fuzzy: {
                        t_norm: 'minimum_t_norm',
                        s_norm: 'maximum_s_norm',
                        threshold: 0,
                    },
                    list_matching: {
                        threshold: 0,
                        is_percentage: false,
                    },
                    sources: {
                        properties: this.linksetSpec.sources
                            .filter(entityTypeSelection => entityTypeSelection !== '')
                            .reduce((acc, entityTypeSelection) => ({
                                ...acc,
                                [entityTypeSelection]: [{
                                    property: [''],
                                    transformers: []
                                }]
                            }), {}),
                        transformers: [],
                    },
                    targets: {
                        properties: this.linksetSpec.targets
                            .filter(entityTypeSelection => entityTypeSelection !== '')
                            .reduce((acc, entityTypeSelection) => ({
                                ...acc,
                                [entityTypeSelection]: [{
                                    property: [''],
                                    transformers: []
                                }]
                            }), {}),
                        transformers: [],
                    },
                });
            },

            addEntityTypeSelection(key) {
                this.linksetSpec[key].push('');
            },

            createExtract() {
                return {
                    sources: [['uri']],
                    targets: [['']],
                    entity_type_selections: [],
                    strengths: [],
                    s_norm: 'maximum_s_norm',
                    threshold: 0,
                };
            },

            updateView() {
                if (this.linksetSpec.matching === 'methods')
                    this.$root.updateView(this.linksetSpec.id, 'linkset',
                        new Set([...this.linksetSpec.sources, ...this.linksetSpec.targets]));
                else
                    this.$root.updateView(this.linksetSpec.id, 'linkset',
                        new Set(Object.values(this.linksetSpec.extract.elements).reduce((acc, element) => {
                            acc.push(...element.entity_type_selections);
                            return acc;
                        }, [])));
            },

            updateEntityTypeSelection(key, index, id) {
                const oldId = this.linksetSpec[key][index];

                if (id !== undefined)
                    this.$set(this.linksetSpec[key], index, id);
                else
                    this.$delete(this.linksetSpec[key], index);

                const shouldRemove = !this.linksetSpec[key].find(etsId => etsId === oldId);
                const shouldAdd = id !== undefined;

                if (this.linksetSpec.matching === 'methods') {
                    if (shouldRemove)
                        this.$root.getRecursiveElements(this.linksetSpec.methods, 'conditions').forEach(condition => {
                            if (condition[key].properties.hasOwnProperty(oldId))
                                this.$delete(condition[key].properties, oldId);
                        });

                    if (shouldAdd)
                        this.$root.getRecursiveElements(this.linksetSpec.methods, 'conditions').forEach(condition => {
                            if (!condition[key].properties.hasOwnProperty(id))
                                this.$set(condition[key].properties, id, [{
                                    property: [''],
                                    transformers: [],
                                }]);
                        });
                }
                else if (this.linksetSpec.matching === 'extract') {
                    if (shouldRemove && this.linksetSpec.extract.elements.hasOwnProperty(oldId))
                        this.$delete(this.linksetSpec.extract.elements, oldId);

                    if (shouldAdd && (!this.linksetSpec.extract.elements.hasOwnProperty(id)))
                        this.$set(this.linksetSpec.extract.elements, id, this.createExtract());
                }

                this.updateView();
            },

            updateType() {
                if (this.linksetSpec.matching === 'methods') {
                    this.addEntityTypeSelection('targets');
                    this.linksetSpec.extract.elements = {};
                    this.addCondition(this.linksetSpec.methods);
                }
                else if (this.linksetSpec.matching === 'extract') {
                    this.linksetSpec.targets = [];
                    this.linksetSpec.methods = {type: 'and', conditions: []};
                    this.linksetSpec.extract.elements = this.linksetSpec.sources
                        .filter(entityTypeSelection => entityTypeSelection !== '')
                        .reduce((acc, entityTypeSelection) => ({
                            ...acc,
                            [entityTypeSelection]: this.createExtract()
                        }), {});
                }

                this.updateView();
            },

            updateLogicBoxTypes(conditions) {
                if (conditions.hasOwnProperty('type')) {
                    if (this.useFuzzyLogic) {
                        if (conditions.type === 'and')
                            conditions.type = 'minimum_t_norm';
                        if (conditions.type === 'or')
                            conditions.type = 'maximum_s_norm';

                        this.$set(conditions, 'threshold', 0);
                    }
                    else {
                        if (this.tNorms.includes(conditions.type))
                            conditions.type = 'and';
                        if (this.sNorms.includes(conditions.type))
                            conditions.type = 'or';

                        this.$delete(conditions, 'threshold');
                    }
                }

                if (conditions.hasOwnProperty('conditions'))
                    conditions.conditions.forEach(condition => this.updateLogicBoxTypes(condition));
            },

            async runLinkset(force = false) {
                if (this.validateLinkset()) {
                    const data = await this.$root.runLinkset(this.linksetSpec.id, force);
                    if (data.result === 'exists' && confirm('This linkset already exists.\nDo you want to overwrite it with the current configuration?'))
                        await this.runLinkset(true);
                }
            },

            async runClustering() {
                await this.$root.runClustering('linkset', this.linksetSpec.id);
            },

            async killLinkset() {
                await this.$root.killLinkset(this.linksetSpec.id);
            },

            async killClustering() {
                await this.$root.killClustering('linkset', this.linksetSpec.id);
            },
        },
        mounted() {
            if (this.linksetSpec.sources.length === 0)
                this.addEntityTypeSelection('sources');

            this.useFuzzyLogic = !['and', 'or'].includes(this.linksetSpec.methods.type);
        },
        watch: {
            useFuzzyLogic() {
                this.updateLogicBoxTypes(this.linksetSpec.methods);

                if (this.useFuzzyLogic && !this.linksetSpec.extract.hasOwnProperty('s_norm')) {
                    this.$set(this.linksetSpec.extract, 's_norm', 'maximum_s_norm');
                    this.$set(this.linksetSpec.extract, 'threshold', 0);
                }
                else if (!this.useFuzzyLogic) {
                    this.$delete(this.linksetSpec.extract, 's_norm');
                    this.$delete(this.linksetSpec.extract, 'threshold');
                }
            },
        },
    };
</script>
