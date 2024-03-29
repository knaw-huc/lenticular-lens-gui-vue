<template>
  <div class="container" id="app">
    <form-wizard :title="title" :subtitle="subtitle" color="#efc501" shape="square" ref="formWizard">
      <tab-content title="Research" :before-change="validateResearchTab">
        <tab-content-structure title="Research" :tab-error="tabError" :is-saved="isSaved"
                               :show-title="state === 'done'">
          <template v-slot:header>
            <div class="col-auto" v-if="$root.job">
              <span class="badge badge-secondary">
                Created {{ $root.job.created_at | moment("MMMM Do YYYY, HH:mm:ss") }}
              </span>
            </div>
          </template>

          <loading v-if="state === 'init'" class="mt-3"/>

          <card v-else-if="state === 'auth'" :has-collapse="false">
            <div class="col-auto text-center">
              <p class="font-weight-bold px-5" v-html="authText"></p>

              <a class="btn btn-secondary" :href="loginUrl">
                Login
              </a>
            </div>
          </card>

          <research-form
              v-else-if="!isLoading && (jobId || createNew)"
              :job-id="jobId"
              :job-title="$root.job ? $root.job.job_title : null"
              :job-description="$root.job ? $root.job.job_description : null"
              :job-link="$root.job ? $root.job.job_link : null"
              :is-updating="isUpdating"
              @create="createJob($event)"
              @update="updateJobResearch($event)"/>

          <research-list
              v-else
              :job-id="jobId"
              :is-loading="isLoading"
              @load="setJobId($event)"
              @new="createNew = true"/>
        </tab-content-structure>
      </tab-content>

      <tab-content title="Entity-type selections" :before-change="validateEntityTypeSelectionsTab">
        <tab-content-structure title="Entity-type selections" :tab-error="tabError" :is-saved="isSaved">
          <template v-slot:header>
            <div v-if="entityTypeSelectionOpen === null" class="col-auto">
              <button-add @click="addEntityTypeSelection" title="Add an Entity-type selection" size="2x"/>
            </div>
          </template>

          <draggable v-model="$root.entityTypeSelections" group="entityTypeSelections" handle=".handle">
            <entity-type-selection
                v-for="(entityTypeSelection, index) in $root.entityTypeSelections"
                v-show="entityTypeSelectionOpen === entityTypeSelection.id || entityTypeSelectionOpen === null"
                :key="entityTypeSelection.id"
                :entity-type-selection="entityTypeSelection"
                @duplicate="duplicateEntityTypeSelection($event)"
                @remove="$root.entityTypeSelections.splice(index, 1)"
                @show="entityTypeSelectionOpen = entityTypeSelection.id"
                @hide="entityTypeSelectionOpen = null"
                ref="entityTypeSelectionComponents"/>
          </draggable>
        </tab-content-structure>
      </tab-content>

      <tab-content title="Linkset specs" :before-change="validateLinksetSpecsTab">
        <tab-content-structure title="Linkset specs" :tab-error="tabError" :is-saved="isSaved">
          <template v-slot:header>
            <div v-if="linksetSpecOpen === null" class="col-auto">
              <button-add @click="addLinksetSpec" title="Add a Linkset Spec" size="2x"/>
            </div>
          </template>

          <draggable v-model="$root.linksetSpecs" group="linksetSpecs" handle=".handle">
            <linkset
                v-for="linksetSpec in $root.linksetSpecs"
                v-show="linksetSpecOpen === linksetSpec.id || linksetSpecOpen === null"
                :key="linksetSpec.id"
                :linkset-spec="linksetSpec"
                :allow-delete="!specsUsedInLens.find(spec => spec.type === 'linkset' && spec.id === linksetSpec.id)"
                @duplicate="duplicateLinksetSpec($event)"
                @submit="$root.submit()"
                @remove="removeSpec('linkset', linksetSpec.id)"
                @update:label="linksetSpec.label = $event"
                @show="linksetSpecOpen = linksetSpec.id"
                @hide="linksetSpecOpen = null"
                ref="linksetSpecComponents"/>
          </draggable>
        </tab-content-structure>
      </tab-content>

      <tab-content title="Lens specs" :before-change="validateLensSpecsTab">
        <tab-content-structure title="Lens specs" :tab-error="tabError" :is-saved="isSaved">
          <template v-slot:header>
            <div v-if="lensSpecOpen === null" class="col-auto">
              <button-add @click="addLensSpec" title="Add a Lens Spec" size="2x"/>
            </div>
          </template>

          <draggable v-model="$root.lensSpecs" group="lensSpecs" handle=".handle">
            <lens
                v-for="lensSpec in $root.lensSpecs"
                v-show="lensSpecOpen === lensSpec.id || lensSpecOpen === null"
                :key="lensSpec.id"
                :lens-spec="lensSpec"
                :allow-delete="!specsUsedInLens.find(spec => spec.type === 'lens' && spec.id === lensSpec.id)"
                @duplicate="duplicateLensSpec($event)"
                @submit="$root.submit()"
                @remove="removeSpec('lens', lensSpec.id)"
                @update:label="lensSpec.label = $event"
                @show="lensSpecOpen = lensSpec.id"
                @hide="lensSpecOpen = null"
                ref="lensSpecComponents"/>
          </draggable>
        </tab-content-structure>
      </tab-content>

      <tab-content title="Validation">
        <tab-content-structure title="Validation" :tab-error="tabError" :is-saved="isSaved">
          <validation
              v-for="spec in specsWithResults"
              v-show="validationOpen === spec.uid || validationOpen === null"
              :key="spec.uid"
              :type="spec.type"
              :spec="spec.spec"
              @show="validationOpen = spec.uid"
              @hide="validationOpen = null"/>
        </tab-content-structure>
      </tab-content>

      <tab-content title="Export">
        <tab-content-structure title="Export" :tab-error="tabError" :is-saved="isSaved">
          <export
              v-for="spec in specsWithResults"
              v-show="exportOpen === spec.uid || exportOpen === null"
              :key="spec.uid"
              :type="spec.type"
              :spec="spec.spec"
              @show="exportOpen = spec.uid"
              @hide="exportOpen = null"/>
        </tab-content-structure>
      </tab-content>

      <template v-if="[0,1,2,3].includes(props.activeTabIndex)" slot="next" slot-scope="props">
        <template v-if="props.activeTabIndex === 0">
          <wizard-button
              v-if="$root.job || createNew"
              :style="props.fillButtonStyle"
              @click.native.stop="setJobId()">
            Cancel
          </wizard-button>

          <wizard-button
              :style="props.fillButtonStyle"
              :disabled="props.loading || !$root.job">
            Next
          </wizard-button>
        </template>

        <template v-if="[1,2,3].includes(props.activeTabIndex)">
          <wizard-button
              v-if="hasChanges && [1,2].includes(props.activeTabIndex)"
              :style="props.fillButtonStyle"
              :disabled="props.loading"
              @click.native.stop="validateAndSave(props.activeTabIndex)">
            Save
          </wizard-button>

          <wizard-button
              :style="props.fillButtonStyle"
              :disabled="props.loading">
            Save and next
          </wizard-button>
        </template>
      </template>

      <template slot="finish" slot-scope="props" style="display: none">&#8203;</template>
    </form-wizard>
  </div>
</template>

<script>
    import Draggable from 'vuedraggable';

    import ResearchForm from './components/steps/research/ResearchForm';
    import ResearchList from './components/steps/research/ResearchList';
    import EntityTypeSelection from './components/steps/entity_type_selections/EntityTypeSelection';
    import Linkset from './components/steps/linksets/Linkset';
    import Lens from './components/steps/lenses/Lens';
    import Validation from './components/steps/validation/Validation';
    import Export from './components/steps/export/Export';

    import ValidationMixin from './mixins/ValidationMixin';
    import TabContentStructure from './components/structural/TabContentStructure';

    import {getTitle, getSubTitle, isAuthEnabled, getAuthText, getLenticularLensApi} from './utils/config';

    export default {
        name: 'App',
        mixins: [ValidationMixin],
        components: {
            Draggable,
            TabContentStructure,
            ResearchForm,
            ResearchList,
            EntityTypeSelection,
            Linkset,
            Lens,
            Validation,
            Export,
        },
        data() {
            return {
                title: getTitle(),
                subtitle: getSubTitle(),
                authText: getAuthText(),
                tabError: '',
                jobId: '',
                createNew: false,
                isSaved: true,
                isLoading: false,
                isUpdating: false,
                state: 'init',
                entityTypeSelectionOpen: null,
                linksetSpecOpen: null,
                lensSpecOpen: null,
                validationOpen: null,
                exportOpen: null,
                steps: ['research', 'entityTypeSelections', 'linksetSpecs', 'lensSpecs', 'validation', 'export'],
            };
        },
        computed: {
            loginUrl() {
                return '/login?redirect-uri=' + encodeURIComponent(window.location.href);
            },

            hasChanges() {
                return !Boolean(this.$root.job)
                    || this.$root.hasUnsavedEntityTypeSelections || this.$root.hasUnsavedLinksetSpecs
                    || this.$root.hasUnsavedLensSpecs || this.$root.hasUnsavedViews;
            },

            hasEntityTypeSelections() {
                return this.$root.entityTypeSelections.length > 0;
            },

            hasFinishedLinkset() {
                return Boolean(this.$root.linksets.find(linkset =>
                    linkset.status === 'done' && linkset.links_count > 0));
            },

            specsWithResults() {
                const linksetSpecs = this.$root.linksetSpecs.filter(linksetSpec => {
                    return this.$root.linksets.find(linkset => {
                        return linkset.spec_id === linksetSpec.id
                            && linkset.status === 'done' && linkset.links_count > 0;
                    });
                });

                const lensSpecs = this.$root.lensSpecs.filter(lensSpec => {
                    return this.$root.lenses.find(lens => {
                        return lens.spec_id === lensSpec.id && lens.status === 'done' && lens.links_count > 0;
                    });
                });

                return [
                    ...linksetSpecs.map(linksetSpec => ({
                        uid: `linkset_${linksetSpec.id}`,
                        type: 'linkset',
                        spec: linksetSpec,
                    })),
                    ...lensSpecs.map(lensSpec => ({
                        uid: `lensSpec_${lensSpec.id}`,
                        type: 'lens',
                        spec: lensSpec,
                    }))
                ];
            },

            specsUsedInLens() {
                const specsInLens = lensSpec => this.$root
                    .getRecursiveElements(lensSpec.specs, 'elements')
                    .flatMap(elem => {
                        if (elem.type === 'lens') {
                            const elemLensSpec = this.$root.getLensSpecById(elem.id);
                            if (elemLensSpec)
                                return [({type: 'lens', id: elemLensSpec.id}), ...specsInLens(elemLensSpec)];
                        }
                        else if (elem.type === 'linkset') {
                            const elemLinksetSpec = this.$root.getLinksetSpecById(elem.id);
                            if (elemLinksetSpec)
                                return [({type: 'linkset', id: elemLinksetSpec.id})];
                        }

                        return [];
                    });

                const specs = this.$root.lensSpecs.reduce((acc, lensSpec) => acc.concat(specsInLens(lensSpec)), []);
                return [...new Set(specs)];
            },
        },
        methods: {
            isTabValid(isValid, isSaved, message) {
                this.tabError = isValid ? '' : message;
                this.isSaved = isSaved;
                return !!isValid;
            },

            validateResearchTab() {
                return this.isTabValid(this.$root.job, false, 'Please update or create your research first!');
            },

            validateEntityTypeSelectionsTab(alwaysSave = false) {
                const results = this.$refs.entityTypeSelectionComponents
                    .map(entityTypeSelectionComponent => entityTypeSelectionComponent.validateEntityTypeSelection());

                const isValid = results.includes(false)
                    ? this.isTabValid(false, alwaysSave,
                        'One or more entity-type selections contain errors!')
                    : this.isTabValid(this.$root.entityTypeSelections.length > 0, false,
                        'Please add at least one entity-type selection!');

                if ((isValid || alwaysSave) && this.$root.hasUnsavedEntityTypeSelections)
                    this.$root.submit();

                return isValid;
            },

            validateLinksetSpecsTab(alwaysSave = false) {
                const results = this.$refs.linksetSpecComponents
                    .map(linksetSpecComponent => linksetSpecComponent.validateLinkset());

                const isValid = results.includes(false)
                    ? this.isTabValid(false, alwaysSave,
                        'One or more linkset specs contain errors!')
                    : this.isTabValid(this.$root.linksetSpecs.length > 0, false,
                        'Please add at least one linkset spec!');

                if ((isValid || alwaysSave) && this.$root.hasUnsavedLinksetSpecs)
                    this.$root.submit();

                return isValid;
            },

            validateLensSpecsTab(alwaysSave = false) {
                const results = this.$refs.lensSpecComponents
                    ? this.$refs.lensSpecComponents.map(lensSpecComponent => lensSpecComponent.validateLens())
                    : [];

                const isValid = this.isTabValid(!results.includes(false), alwaysSave,
                    'One or more lensSpec specs contain errors!');

                if ((isValid || alwaysSave) && this.$root.hasUnsavedLensSpecs)
                    this.$root.submit();

                return isValid;
            },

            validateAndSave(activeTabIndex) {
                switch (activeTabIndex) {
                    case 1:
                        return this.validateEntityTypeSelectionsTab(true);
                    case 2:
                        return this.validateLinksetSpecsTab(true);
                    case 3:
                        return this.validateLensSpecsTab(true);
                    default:
                        return false;
                }
            },

            activateStep(stepName, jump = false) {
                const stepIndex = this.steps.indexOf(stepName);
                if (stepIndex < 0 || typeof this.$refs.formWizard.tabs[stepIndex] === 'undefined') {
                    for (let i = 1; i < this.steps.length; i++)
                        this.$set(this.$refs.formWizard.tabs[i], 'checked', false);

                    this.$set(this.$refs.formWizard, 'maxStep', 0);
                }
                else {
                    for (let i = 0; i <= stepIndex; i++)
                        this.$set(this.$refs.formWizard.tabs[i], 'checked', true);

                    this.$set(this.$refs.formWizard, 'maxStep', stepIndex);

                    if (jump)
                        this.$refs.formWizard.changeTab(this.$refs.formWizard.activeTabIndex, stepIndex);
                }
            },

            addEntityTypeSelection() {
                this.$root.addEntityTypeSelection();
            },

            addLinksetSpec() {
                this.$root.addLinksetSpec();
            },

            addLensSpec() {
                this.$root.addLensSpec();
            },

            duplicateEntityTypeSelection(entityTypeSelection) {
                this.$root.duplicateEntityTypeSelection(entityTypeSelection);
            },

            duplicateLinksetSpec(linksetSpec) {
                this.$root.duplicateLinksetSpec(linksetSpec);
            },

            duplicateLensSpec(lensSpec) {
                this.$root.duplicateLensSpec(lensSpec);
            },

            async createJob(inputs) {
                const jobId = await this.$root.createJob(inputs);
                await this.setJobId(jobId);
            },

            async updateJobResearch(jobData) {
                this.isUpdating = true;

                await this.$root.updateJob(jobData);
                await this.$root.loadJob(this.jobId);

                this.isUpdating = false;
            },

            async setJobId(jobId, fromUrl = false) {
                this.jobId = jobId;
                this.isLoading = true;
                this.createNew = false;

                if (!fromUrl) {
                    const parsedUrl = new URL(window.location.href);
                    this.jobId
                        ? parsedUrl.searchParams.set('job_id', this.jobId)
                        : parsedUrl.searchParams.delete('job_id');
                    window.history.pushState(null, null, parsedUrl.href);
                }

                if (this.jobId) {
                    await this.$root.loadJob(this.jobId);

                    if (this.hasFinishedLinkset)
                        this.activateStep('export');
                    else if (this.hasEntityTypeSelections)
                        this.activateStep('linksetSpecs');
                    else
                        this.activateStep('entityTypeSelections');

                    if (this.$root.entityTypeSelections.length === 0)
                        this.$root.addEntityTypeSelection();

                    if (this.$root.linksetSpecs.length === 0)
                        this.$root.addLinksetSpec();
                }
                else {
                    this.activateStep();
                    this.$root.reset();
                }

                this.isLoading = false;
            },

            async removeSpec(type, id) {
                if (this.specsUsedInLens.find(spec => spec.type === type && spec.id === id))
                    return;

                if (confirm(`Are you sure you want to delete this ${type}?`)) {
                    if (type === 'linkset') {
                        if (this.$root.linksets.find(linkset => linkset.spec_id === id)) {
                            const response = await this.$root.deleteResult(type, id);
                            if (response.result === 'fail') return;
                        }

                        const index = this.$root.linksetSpecs.findIndex(linkset => linkset.id === id);
                        this.$root.linksetSpecs.splice(index, 1);

                        const viewIdx = this.$root.views.findIndex(view => view.id === id && view.type === 'linkset');
                        if (viewIdx > -1)
                            this.$root.views.splice(viewIdx, 1);

                        await this.$root.submit();
                    }
                    else if (type === 'lens') {
                        if (this.$root.lenses.find(lens => lens.spec_id === id)) {
                            const response = await this.$root.deleteResult(type, id);
                            if (response.result === 'fail') return;
                        }

                        const index = this.$root.lensSpecs.findIndex(lens => lens.id === id);
                        this.$root.lensSpecs.splice(index, 1);

                        const viewIdx = this.$root.views.findIndex(view => view.id === id && view.type === 'lens');
                        if (viewIdx > -1)
                            this.$root.views.splice(viewIdx, 1);

                        await this.$root.submit();
                    }
                }
            },
        },
        async mounted() {
            if (isAuthEnabled()) {
                const response = await fetch(getLenticularLensApi() + '/user_info');
                if (response.status === 401) {
                    this.state = 'auth';
                    return;
                }
            }

            Promise.all([
                this.$root.resetDownloads(),
                this.$root.loadMethods()
            ]).then(_ => this.state = 'done');

            const urlParams = new URLSearchParams(window.location.search);
            const jobId = urlParams.get('job_id');
            if (jobId)
                this.setJobId(jobId, true);
        },
        watch: {
            hasEntityTypeSelections() {
                if (this.hasEntityTypeSelections)
                    this.activateStep('linksetSpecs');
            },

            hasFinishedLinkset() {
                if (this.hasFinishedLinkset)
                    this.activateStep('export');
            },
        },
    };
</script>