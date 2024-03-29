<template>
  <card :id="'lens_spec_' + lensSpec.id" type="lens-specs" :res-id="lensSpec.id" v-model="lensSpec.label"
        :has-error="errors.length > 0" :has-handle="true" :has-extra-row="!!lens"
        @show="onToggle(true)" @hide="onToggle(false)">
    <template v-slot:title-columns>
      <div v-if="!isOpen" class="col-auto">
        <button class="btn btn-secondary" @click="$emit('duplicate', lensSpec)">Duplicate</button>
      </div>

      <div v-if="lensStatus === 'downloading' || lensStatus === 'running'" class="col-auto">
        <button class="btn btn-danger" @click="killLens">
          Stop
        </button>
      </div>

      <div v-if="clusteringStatus === 'running'" class="col-auto">
        <button class="btn btn-danger" @click="killClustering">
          Stop
        </button>
      </div>

      <div v-if="!lens || lensStatus === 'failed'" class="col-auto">
        <button class="btn btn-secondary" @click="runLens()">
          Run
          <template v-if="lensStatus === 'failed'">again</template>
        </button>
      </div>

      <div v-if="lensStatus === 'done' && lens.links_count > 0 && (!clustering || clusteringStatus === 'failed')"
           class="col-auto">
        <button type="button" class="btn btn-secondary my-1" @click="runClustering($event)">
          Cluster
          <template v-if="clusteringStatus === 'failed'">again</template>
        </button>
      </div>

      <div v-if="!isOpen" class="col-auto">
        <button-delete @click="$emit('remove')" title="Delete this lens" :disabled="!allowDelete"/>
      </div>
    </template>

    <template v-slot:columns>
      <div v-if="lens" class="col">
        <status :lens-spec="lensSpec"/>
      </div>
    </template>

    <sub-card label="Description">
      <textarea class="form-control mt-3" :id="'description_' + lensSpec.id" v-model="lensSpec.description">
      </textarea>

      <small class="form-text text-muted mt-2">
        Provide a description for this lens
      </small>
    </sub-card>

    <fieldset :disabled="!!lens">
      <sub-card label="Operations" :has-columns="true" :hasError="errors.includes('elements')">
        <template v-slot:columns>
          <div class="col-auto">
            <div class="custom-control custom-switch">
              <input type="checkbox" class="custom-control-input" autocomplete="off"
                     :id="'fuzzy_lens_' + lensSpec.id" v-model="useFuzzyLogic"/>
              <label class="custom-control-label" :for="'fuzzy_lens_' + lensSpec.id">Use fuzzy logic</label>
            </div>
          </div>
        </template>

        <logic-box :element="lensSpec.specs" elements-name="elements" :is-root="true"
                   :should-have-elements="true" :controlled-elements="true" :group="'lens' + lensSpec.id"
                   :uid="'lens_' + lensSpec.id  + '_0'" validate-method-name="validateLensElement"
                   empty-elements-text="No lens elements"
                   validation-failed-text="Please provide at least one lens element"
                   :options="lensOptions" :option-groups="lensOptionGroups"
                   :option-descriptions="lensOptionDescriptions" :group-include="groupInclude"
                   @add="addLensElement($event)" @remove="removeLensElement($event)"
                   ref="lensGroupComponent">
          <template v-slot:box-slot="boxElement">
            <div v-if="useFuzzyLogic && !isOnlyLeft(boxElement.element.type)" class="col-auto">
              <select :id="'s_norm_' + boxElement.index" class="form-control form-control-sm"
                      v-model="boxElement.element.s_norm">
                <option v-for="(description, key) in sNorms" :value="key">
                  {{ description }}
                </option>
              </select>
            </div>

            <div v-if="useFuzzyLogic && !isOnlyLeft(boxElement.element.type)" class="col-auto">
              <range :id="'threshold_' + boxElement.index" v-model.number="boxElement.element.threshold"
                     label="Threshold" :allow-zero="false"/>
            </div>
          </template>

          <template v-slot="curElement">
            <lens-element :type="curElement.type" :element="curElement.element" :index="curElement.index"
                          :disabled="!!lens" @add="curElement.add()" @remove="curElement.remove()"
                          @update="updateView()"/>
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

    import Status from "./Status";
    import LensElement from "./LensElement";

    export default {
        name: "Lens",
        mixins: [ValidationMixin],
        components: {
            LogicBox,
            Status,
            LensElement
        },
        props: {
            lensSpec: Object,
            allowDelete: Boolean,
        },
        data() {
            return {
                isOpen: false,
                useFuzzyLogic: false,
                lensOptions: props.lensOptions,
                lensOptionGroups: props.lensOptionGroups,
                lensOptionDescriptions: props.lensOptionDescriptions,
                sNorms: props.sNorms,
            };
        },
        computed: {
            view() {
                return this.$root.getViewByIdAndType(this.lensSpec.id, 'lens');
            },

            lens() {
                return this.$root.lenses.find(lens => lens.spec_id === this.lensSpec.id);
            },

            clustering() {
                return this.$root.clusterings.find(clustering =>
                    clustering.spec_type === 'lens' && clustering.spec_id === this.lensSpec.id);
            },

            lensStatus() {
                return this.lens ? this.lens.status : null;
            },

            clusteringStatus() {
                return this.clustering ? this.clustering.status : null;
            },

            groupInclude() {
                return {s_norm: this.useFuzzyLogic ? 'maximum_s_norm' : '', threshold: 0};
            },
        },
        methods: {
            validateLens() {
                return this.$refs.lensGroupComponent.validateLogicBox();
            },

            isOnlyLeft(type) {
                return type === 'difference' || type.startsWith('in_set');
            },

            onToggle(isOpen) {
                this.isOpen = isOpen;
                isOpen ? this.$emit('show') : this.$emit('hide');
            },

            addLensElement(group) {
                if (group.elements.length < 2) {
                    group.elements.push({id: null, type: 'linkset'});
                    this.addLensElement(group);
                }
            },

            removeLensElement({group, index}) {
                const element = group.elements[index].elements[0];
                const elementCopy = JSON.parse(JSON.stringify(element));

                this.$set(group.elements, index, elementCopy);
            },

            updateView() {
                this.$root.updateView(this.lensSpec.id, 'lens',
                    new Set(this.$root.getLinksetSpecsInLens(this.lensSpec.id)
                        .flatMap(linksetSpec => [...linksetSpec.sources, ...linksetSpec.targets])));
            },

            updateLogicBoxTypes(elements) {
                if (elements.hasOwnProperty('type')) {
                    if (this.useFuzzyLogic) {
                        this.$set(elements, 's_norm', 'maximum_s_norm');
                        this.$set(elements, 'threshold', 0);
                    }
                    else {
                        this.$set(elements, 's_norm', '');
                        this.$delete(elements, 'threshold');
                    }
                }

                if (elements.hasOwnProperty('elements'))
                    elements.elements.forEach(element => this.updateLogicBoxTypes(element));
            },

            async runLens(force = false) {
                if (this.validateLens()) {
                    const data = await this.$root.runLens(this.lensSpec.id, force);
                    if (data.result === 'exists' && confirm('This lens already exists.\nDo you want to overwrite it with the current configuration?'))
                        await this.runLens(true);
                }
            },

            async runClustering() {
                await this.$root.runClustering('lens', this.lensSpec.id);
            },

            async killLens() {
                await this.$root.killLens(this.lensSpec.id);
            },

            async killClustering() {
                await this.$root.killClustering('lens', this.lensSpec.id);
            },
        },
        mounted() {
            this.useFuzzyLogic = !!this.lensSpec.specs.sNorm;
        },
        watch: {
            useFuzzyLogic() {
                this.updateLogicBoxTypes(this.lensSpec.specs);
            },
        },
    };
</script>
