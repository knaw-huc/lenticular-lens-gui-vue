<template>
  <card :id="'validation_' + type + '_' + spec.id" type="validation" :res-id="spec.id" :res-type="type"
        :label="spec.label" :has-extra-row="true" @show="onToggle(true)" @hide="onToggle(false)">
    <template v-slot:columns>
      <div class="col">
        <sub-card :is-first="true" class="small">
          <div class="row justify-content-center">
            <div class="col-auto">
              <div>
                <strong>Links: </strong>
                {{ isLinkset ? linkset.links_count.toLocaleString('en') : lens.links_count.toLocaleString('en') }}
              </div>
              <div v-if="clustering">
                <strong>Clusters: </strong>
                {{ clustering.clusters_count.toLocaleString('en') }}
              </div>
            </div>

            <div v-if="isLinkset" class="col-auto">
              <div>
                <strong>Source / target / total entities in linkset: </strong>
                {{ linkset.linkset_sources_count ? linkset.linkset_sources_count.toLocaleString('en') : 0 }} /
                {{ linkset.linkset_targets_count ? linkset.linkset_targets_count.toLocaleString('en') : 0 }} /
                {{ linkset.linkset_entities_count ? linkset.linkset_entities_count.toLocaleString('en') : 0 }}
              </div>

              <div>
                <strong>Entities in source / target / total: </strong>
                {{ linkset.sources_count ? linkset.sources_count.toLocaleString('en') : 0 }} /
                {{ linkset.targets_count ? linkset.targets_count.toLocaleString('en') : 0 }} /
                {{ linkset.entities_count ? linkset.entities_count.toLocaleString('en') : 0 }}
              </div>
            </div>

            <div v-else class="col-auto">
              <div>
                <strong>Source / target entities in lens: </strong>
                {{ lens.lens_sources_count ? lens.lens_sources_count.toLocaleString('en') : 0 }} /
                {{ lens.lens_targets_count ? lens.lens_targets_count.toLocaleString('en') : 0 }}
              </div>

              <div>
                <strong>Total entities in lens: </strong>
                {{ lens.lens_entities_count ? lens.lens_entities_count.toLocaleString('en') : 0 }}
              </div>
            </div>

            <div v-if="clustering" class="col-auto">
              <div>
                <strong>Extended: </strong>

                <strong>Yes = </strong>
                {{ clustering.extended_count ? clustering.extended_count.toLocaleString('en') : 0 }}

                <strong>No = </strong>
                {{ (clustering.clusters_count - clustering.extended_count).toLocaleString('en') }}
              </div>
              <div>
                <strong>Cycles: </strong>

                <strong>Yes = </strong>
                {{ clustering.cycles_count ? clustering.cycles_count.toLocaleString('en') : 0 }}

                <strong>No = </strong>
                {{ (clustering.clusters_count - clustering.cycles_count).toLocaleString('en') }}
              </div>
            </div>
          </div>

          <div v-if="isOpen" class="row justify-content-center mt-2">
            <div class="col-auto">
              <div class="btn-toolbar" role="toolbar" aria-label="Toolbar">
                <div class="btn-group btn-group-sm btn-group-toggle ml-auto">
                  <label class="btn btn-secondary" v-bind:class="{'active': showAcceptedLinks}">
                    <input type="checkbox" autocomplete="off" v-model="showAcceptedLinks"
                           :disabled="loadingTotals" @change="resetLinks('reset')"/>
                    {{ showAcceptedLinks ? 'Hide accepted' : 'Show accepted' }}

                    <span v-if="acceptedLinks !== null || allAcceptedLinks !== null" class="badge badge-light ml-1">
                      <template v-if="acceptedLinks !== null && allAcceptedLinks !== null">
                        {{ acceptedLinks.toLocaleString('en') }} /
                      </template>

                      <template v-if="allAcceptedLinks !== null">
                        {{ allAcceptedLinks.toLocaleString('en') }}
                      </template>
                    </span>
                  </label>

                  <label class="btn btn-secondary" v-bind:class="{'active': showRejectedLinks}">
                    <input type="checkbox" autocomplete="off" v-model="showRejectedLinks"
                           :disabled="loadingTotals" @change="resetLinks('reset')"/>
                    {{ showRejectedLinks ? 'Hide rejected' : 'Show rejected' }}

                    <span v-if="rejectedLinks !== null || allRejectedLinks !== null" class="badge badge-light ml-1">
                      <template v-if="rejectedLinks !== null && allRejectedLinks !== null">
                        {{ rejectedLinks.toLocaleString('en') }} /
                      </template>

                      <template v-if="allRejectedLinks !== null">
                        {{ allRejectedLinks.toLocaleString('en') }}
                      </template>
                    </span>
                  </label>

                  <label class="btn btn-secondary" v-bind:class="{'active': showUncertainLinks}">
                    <input type="checkbox" autocomplete="off" v-model="showUncertainLinks"
                           :disabled="loadingTotals" @change="resetLinks('reset')"/>
                    {{ showUncertainLinks ? 'Hide uncertain' : 'Show uncertain' }}

                    <span v-if="uncertainLinks !== null || allAcceptedLinks !== null" class="badge badge-light ml-1">
                      <template v-if="uncertainLinks !== null && allUncertainLinks !== null">
                        {{ uncertainLinks.toLocaleString('en') }} /
                      </template>

                      <template v-if="allUncertainLinks !== null">
                        {{ allUncertainLinks.toLocaleString('en') }}
                      </template>
                    </span>
                  </label>

                  <label class="btn btn-secondary" v-bind:class="{'active': showUncheckedLinks}">
                    <input type="checkbox" autocomplete="off" v-model="showUncheckedLinks"
                           :disabled="loadingTotals" @change="resetLinks('reset')"/>
                    {{ showUncheckedLinks ? 'Hide unchecked' : 'Show unchecked' }}

                    <span v-if="uncheckedLinks !== null || allUncheckedLinks !== null"
                          class="badge badge-light ml-1">
                      <template v-if="uncheckedLinks !== null && allUncheckedLinks !== null">
                        {{ uncheckedLinks.toLocaleString('en') }} /
                      </template>

                      <template v-if="allUncheckedLinks !== null">
                        {{ allUncheckedLinks.toLocaleString('en') }}
                      </template>
                    </span>
                  </label>

                  <label v-if="isLens" class="btn btn-secondary" v-bind:class="{'active': showDisputedLinks}">
                    <input type="checkbox" autocomplete="off" v-model="showDisputedLinks"
                           :disabled="loadingTotals" @change="resetLinks('reset')"/>
                    {{ showDisputedLinks ? 'Hide disputed' : 'Show disputed' }}

                    <span v-if="disputedLinks !== null || allDisputedLinks !== null" class="badge badge-light ml-1">
                      <template v-if="disputedLinks !== null && allDisputedLinks !== null">
                        {{ disputedLinks.toLocaleString('en') }} /
                      </template>

                      <template v-if="allDisputedLinks !== null">
                        {{ allDisputedLinks.toLocaleString('en') }}
                      </template>
                    </span>
                  </label>
                </div>

                <div class="btn-group btn-group-sm ml-4" role="group">
                  <button type="button" class="btn btn-white border"
                          :disabled="!resetShownLinks" @click="resetLinks('all', 'all')">
                    <fa-icon icon="sync"/>
                    Reset
                  </button>
                </div>

                <div class="btn-group btn-group-sm ml-4">
                  <b-dropdown variant="secondary" size="sm" :disabled="isUpdating">
                    <template #button-content>
                      <fa-icon icon="check-square"/>
                      Validate selection
                    </template>

                    <b-dropdown-item-button variant="success" :disabled="isUpdating"
                                            @click="validateSelection('accepted')">
                      <fa-icon icon="check"/>
                      Accept
                    </b-dropdown-item-button>

                    <b-dropdown-item-button variant="danger" :disabled="isUpdating"
                                            @click="validateSelection('rejected')">
                      <fa-icon icon="times"/>
                      Reject
                    </b-dropdown-item-button>

                    <b-dropdown-item-button variant="warning" :disabled="isUpdating"
                                            @click="validateSelection('uncertain')">
                      <fa-icon icon="question"/>
                      Uncertain
                    </b-dropdown-item-button>

                    <b-dropdown-item-button :disabled="isUpdating"
                                            @click="validateSelection('unchecked')">
                      <fa-icon icon="chevron-left"/>
                      Unchecked (reset validation)
                    </b-dropdown-item-button>
                  </b-dropdown>

                  <b-dropdown variant="secondary" size="sm" :disabled="isUpdating"
                              @show="onOpenMotivation" @hide="onCloseMotivation" @shown="focusOnMotivationTextarea"
                              ref="motivationBtn">
                    <template #button-content>
                      <fa-icon icon="pencil-alt"/>
                      Motivate selection
                    </template>

                    <b-dropdown-form>
                      <div class="form-group mb-2">
                        <textarea class="form-control motivation" v-model="motivation"></textarea>
                      </div>

                      <div class="text-right">
                        <button type="button" class="btn btn-sm border mr-3" :disabled="isUpdating" title="Close (Esc)"
                                @click="closeMotivationButton(false)">
                          Close
                        </button>

                        <button type="button" class="btn btn-sm border" :disabled="isUpdating"
                                title="Save (Shift + Enter)"
                                @click="closeMotivationButton(true)">
                          Save
                        </button>
                      </div>
                    </b-dropdown-form>
                  </b-dropdown>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isOpen" class="row justify-content-center mt-2">
            <div class="col-auto">
              <div class="btn-toolbar align-items-baseline" role="toolbar" aria-label="Toolbar">
                <div class="btn-group btn-group-sm mr-4">
                  <button type="button" class="btn btn-secondary" @click="showSimilarityConfig">
                    <fa-icon icon="info-circle"/>
                    Show specification
                  </button>

                  <button type="button" class="btn btn-secondary" :disabled="!view" @click="showPropertyConfig">
                    <fa-icon icon="cog"/>
                    Configure property labels
                  </button>
                </div>

                <div class="btn-group btn-group-sm mr-4">
                  <button type="button" class="btn btn-secondary" :disabled="!view" @click="showFilterConfig">
                    Filter on properties

                    <span class="badge badge-light ml-1">
                      <template v-if="view">
                        {{ view.filters.filter(f => f.filter.conditions.length > 0).length.toLocaleString('en') }}
                      </template>
                      <template v-else>0</template>
                    </span>
                  </button>

                  <button type="button" class="btn btn-secondary" v-bind:class="{'active': clusters.length > 0}"
                          :disabled="!clustering" @click="showClusters">
                    Filter by cluster

                    <span class="badge badge-light ml-1">
                      {{ clusters.length.toLocaleString('en') }}
                    </span>
                  </button>
                </div>

                <div class="btn-group btn-group-sm btn-group-toggle input-group input-group-sm align-items-baseline">
                  <div class="input-group-prepend">
                    <div class="input-group-text bg-white">Similarity</div>

                    <div class="input-group-text">
                      <vue-slider v-model="similarityRange" class="mx-5 p-0"
                                  :width="150" :min="0" :max="1" :interval="0.05" :lazy="true"
                                  :tooltip-placement="['left', 'right']" tooltip="always"
                                  @change="resetLinks('filtering', 'filtering')"/>
                    </div>
                  </div>

                  <label class="btn btn-secondary" v-bind:class="{'active': sortDesc}">
                    <input type="radio" autocomplete="off" v-model="sortDesc" :value="true" :disabled="loadingTotals"
                           @change="resetLinks('reset', 'none')"/>
                    <fa-icon icon="sort-numeric-up"/>
                  </label>

                  <label class="btn btn-secondary" v-bind:class="{'active': !sortDesc}">
                    <input type="radio" autocomplete="off" v-model="sortDesc" :value="false" :disabled="loadingTotals"
                           @change="resetLinks('reset', 'none')"/>
                    <fa-icon icon="sort-numeric-down"/>
                  </label>
                </div>

                <div class="btn-group btn-group-sm ml-4" role="group">
                  <button class="btn btn-secondary" :disabled="!allowVisualization" @click="showVisualization">
                    <fa-icon icon="project-diagram"/>
                    Visualize
                  </button>
                </div>
              </div>
            </div>
          </div>
        </sub-card>
      </div>
    </template>

    <similarity-config :type="type" :spec="spec"
                       @show="isModalOpen = true" @hide="isModalOpen = false" ref="similarityConfig"/>

    <property-config v-if="view" :properties="view.properties"
                     @save="resetLinks('reset', 'properties')"
                     @show="isModalOpen = true" @hide="isModalOpen = false" ref="propertyConfig"/>

    <filter-config v-if="view" :filters="view.filters"
                   @save="resetLinks('filtering', 'filtering')"
                   @show="isModalOpen = true" @hide="isModalOpen = false" ref="filterConfig"/>

    <clusters v-if="clustering" :type="type" :spec-id="spec.id"
              :selected-clusters="clusters" :similarity-range="similarityRange"
              @select="selectCluster" @select-all="selectClusters" @unselect-all="unselectClusters"
              @show="isModalOpen = true" @hide="onClustersClose" ref="clusters"/>

    <cluster-visualization
        v-if="allowVisualization" :type="type" :spec-id="spec.id" :cluster-id="clusters[0]"
        @show="isModalOpen = true" @hide="isModalOpen = false" ref="visualization"/>

    <template v-if="isOpen && !isUpdatingSelection">
      <link-component
          v-for="(link, idx) in links"
          :key="idx"
          :index="idx"
          :link="link"
          :is-active="currentIdx === idx"
          @accepted="validateLink(link,'accepted')"
          @rejected="validateLink(link,'rejected')"
          @uncertain="validateLink(link,'uncertain')"
          @motivation="setMotivationForLink(link, $event)"
          @motivation_open="isLinkMotivationOpen = true; currentIdx = idx"
          @motivation_close="isLinkMotivationOpen = false"
          ref="link"/>

      <infinite-loading :identifier="linksIdentifier" @infinite="getLinks">
        <template v-slot:spinner>
          <loading class="mt-4"/>
        </template>

        <template v-slot:no-more>
          No more links
        </template>

        <template v-slot:error="{trigger}">
          <div class="text-danger mb-2">
            Failed to obtain links
          </div>
          <button type="button" class="btn btn-sm btn-danger" @click="trigger">Retry</button>
        </template>
      </infinite-loading>
    </template>
  </card>
</template>

<script>
    import VueSlider from 'vue-slider-component';
    import InfiniteLoading from 'vue-infinite-loading';

    import Link from "./Link";
    import SimilarityConfig from "./SimilarityConfig";
    import PropertyConfig from "./PropertyConfig";
    import FilterConfig from "./FilterConfig";
    import Clusters from "./Clusters";
    import ClusterVisualization from "./ClusterVisualization";

    export default {
        name: "Validation",
        components: {
            VueSlider,
            InfiniteLoading,
            LinkComponent: Link,
            SimilarityConfig,
            PropertyConfig,
            FilterConfig,
            Clusters,
            ClusterVisualization,
        },
        data() {
            return {
                isOpen: false,
                isModalOpen: false,
                isUpdating: false,
                isUpdatingSelection: false,

                showAcceptedLinks: false,
                showRejectedLinks: false,
                showUncertainLinks: false,
                showUncheckedLinks: true,
                showDisputedLinks: false,
                resetShownLinks: false,

                allAcceptedLinks: null,
                allRejectedLinks: null,
                allUncertainLinks: null,
                allUncheckedLinks: null,
                allDisputedLinks: null,

                acceptedLinks: null,
                rejectedLinks: null,
                uncertainLinks: null,
                uncheckedLinks: null,
                disputedLinks: null,

                loadingTotals: false,
                loadingLinks: false,

                links: [],
                linksIdentifier: +new Date(),
                currentIdx: 0,

                clusters: [],
                updateClusters: false,

                similarityRange: [0, 1],
                sortDesc: true,

                isLinkMotivationOpen: false,
                motivationIsOpen: false,
                motivation: '',
            };
        },
        props: {
            type: String,
            spec: Object,
        },
        computed: {
            isLinkset() {
                return this.type === 'linkset';
            },

            isLens() {
                return this.type === 'lens';
            },

            view() {
                return this.$root.getViewByIdAndType(this.spec.id, this.type);
            },

            linkset() {
                return this.isLinkset
                    ? this.$root.linksets.find(linkset => linkset.spec_id === this.spec.id)
                    : null;
            },

            lens() {
                return this.isLens
                    ? this.$root.lenses.find(lens => lens.spec_id === this.spec.id)
                    : null;
            },

            clustering() {
                const clustering = this.$root.clusterings.find(clustering =>
                    clustering.spec_type === this.type && clustering.spec_id === this.spec.id);
                if (clustering && clustering.status === 'done')
                    return clustering;

                return null;
            },

            hasProperties() {
                return this.view && !Object.values(this.view.properties)
                    .flatMap(datasetProperty => datasetProperty.properties)
                    .map(prop => prop[0] !== '')
                    .includes(false);
            },

            allowVisualization() {
                return this.clustering && this.hasProperties && this.clusters.length === 1;
            },
        },
        methods: {
            async onToggle(isOpen) {
                if (this.isOpen === isOpen)
                    return

                this.isOpen = isOpen;

                if (isOpen) {
                    this.$emit('show');
                    await this.resetLinks('all', 'all');
                }
                else {
                    this.$emit('hide');
                    await this.resetLinks('reset', 'none');
                }
            },

            closeMotivationButton(save = false) {
                if (this.motivationIsOpen) {
                    this.$refs.motivationBtn.visible = false;
                    if (save)
                        this.setMotivationForSelection();
                }
            },

            onOpenMotivation() {
                this.motivation = '';
                this.motivationIsOpen = true;
            },

            onCloseMotivation() {
                this.motivationIsOpen = false;
            },

            focusOnMotivationTextarea() {
                this.$refs.motivationBtn.$el.querySelector('textarea').focus();
            },

            showSimilarityConfig() {
                this.$refs.similarityConfig.show();
            },

            showPropertyConfig() {
                this.$refs.propertyConfig.show();
            },

            showFilterConfig() {
                this.$refs.filterConfig.show();
            },

            showClusters() {
                this.$refs.clusters.show();
            },

            showVisualization() {
                this.$refs.visualization.showVisualization();
            },

            selectCluster(clusterId) {
                this.updateClusters = true;
                if (this.clusters.includes(clusterId))
                    this.clusters.splice(this.clusters.indexOf(clusterId), 1);
                else
                    this.clusters.push(clusterId);
            },

            selectClusters(clusterIds) {
                this.updateClusters = true;
                clusterIds.forEach(clusterId => {
                    if (!this.clusters.includes(clusterId))
                        this.clusters.push(clusterId);
                });
            },

            unselectClusters(clusterIds) {
                this.updateClusters = true;
                clusterIds.forEach(clusterId => {
                    if (this.clusters.includes(clusterId))
                        this.clusters.splice(this.clusters.indexOf(clusterId), 1);
                });
            },

            onClustersClose() {
                if (this.updateClusters)
                    this.resetLinks('filtering', 'none');

                this.isModalOpen = false;
                this.updateClusters = false;
            },

            async resetLinks(linkUpdate = 'all', clusterUpdate = 'none') {
                if (linkUpdate !== 'none') {
                    this.links = [];
                    this.linksIdentifier += 1;
                    this.currentIdx = 0;
                    this.resetShownLinks = false;
                }

                switch (linkUpdate) {
                    case 'no_filtering':
                        await this.getLinksTotals(false);
                        break;
                    case 'filtering':
                        await this.getLinksTotals(true);
                        break;
                    case 'all':
                        await this.getLinksTotals(false);
                        await this.getLinksTotals(true);
                        break;
                }

                switch (clusterUpdate) {
                    case 'properties':
                        this.$refs.clusters.triggerPropertiesUpdate();
                        break;
                    case 'filtering':
                        this.$refs.clusters.triggerFilteringUpdate();
                        break;
                    case 'all':
                        this.$refs.clusters.triggerPropertiesUpdate();
                        this.$refs.clusters.triggerFilteringUpdate();
                        break;
                }
            },

            async getLinksTotals(applyFiltering) {
                if (this.loadingTotals)
                    return;

                this.loadingTotals = true;

                const totals = await this.$root.getLinksTotals(this.type, this.spec.id, {
                    applyFilters: applyFiltering,
                    clusterIds: applyFiltering ? this.clusters : [],
                    min: applyFiltering ? this.similarityRange[0] : 0,
                    max: applyFiltering ? this.similarityRange[1] : 1
                });

                if (totals) {
                    if (applyFiltering) {
                        this.acceptedLinks = totals.accepted || 0;
                        this.rejectedLinks = totals.rejected || 0;
                        this.uncertainLinks = totals.uncertain || 0;
                        this.uncheckedLinks = totals.unchecked || 0;
                        this.disputedLinks = totals.disputed || 0;
                    }
                    else {
                        this.allAcceptedLinks = totals.accepted || 0;
                        this.allRejectedLinks = totals.rejected || 0;
                        this.allUncertainLinks = totals.uncertain || 0;
                        this.allUncheckedLinks = totals.unchecked || 0;
                        this.allDisputedLinks = totals.disputed || 0;
                    }
                }

                this.loadingTotals = false;
            },

            async getLinks(state) {
                if (this.loadingLinks)
                    return;

                this.loadingLinks = true;

                const links = await this.$root.getLinks(this.type, this.spec.id, {
                    accepted: this.showAcceptedLinks,
                    rejected: this.showRejectedLinks,
                    uncertain: this.showUncertainLinks,
                    unchecked: this.showUncheckedLinks,
                    disputed: this.showDisputedLinks,
                    clusterIds: this.clusters,
                    min: this.similarityRange[0],
                    max: this.similarityRange[1],
                    sort: this.sortDesc ? 'desc' : 'asc'
                }, 20, this.links.length);

                if (links !== null)
                    this.links.push(...links);

                if (state) {
                    if (links === null)
                        state.error();
                    else if (links.length > 0)
                        state.loaded();
                    else
                        state.complete();
                }

                this.loadingLinks = false;
            },

            async onKey(e) {
                if (!this.isOpen || this.isUpdating || this.isModalOpen)
                    return;

                if (this.isLinkMotivationOpen || this.motivationIsOpen) {
                    switch (e.keyCode) {
                        case 13: // enter
                            if (e.shiftKey)
                                this.$refs.link[this.currentIdx].closeMotivationButton(true);
                            break;
                        case 27: // esc
                            this.$refs.link[this.currentIdx].closeMotivationButton(false);
                            break;
                    }
                }
                else {
                    switch (e.keyCode) {
                        case 65: // a
                            await this.validateLink(this.links[this.currentIdx], 'accepted');
                            break;
                        case 88: // x
                            await this.validateLink(this.links[this.currentIdx], 'rejected');
                            break;
                        case 32: // space
                            await this.validateLink(this.links[this.currentIdx], 'uncertain');
                            break;
                        case 77: // m
                            this.$refs.link[this.currentIdx].openMotivationButton();
                            break;
                        case 37: // arrow left
                        case 38: // arrow up
                            if (this.currentIdx > 0)
                                this.currentIdx--;
                            break;
                        case 39: // arrow right
                        case 40: // arrow down
                            if ((this.currentIdx + 1) < this.links.length)
                                this.currentIdx++;
                            break;
                    }

                    this.$refs.link[this.currentIdx].$el.scrollIntoView({behavior: 'smooth'});
                }
            },

            async validateLink(link, validation) {
                const before = link.valid;
                const after = before === validation ? 'unchecked' : validation;

                this.isUpdating = true;
                link.updating = true;

                const result = await this.$root.validateLink(this.type, this.spec.id, after, link.source, link.target);

                this.isUpdating = false;
                link.updating = false;

                if (result !== null) {
                    link.valid = after;

                    switch (before) {
                        case 'unchecked':
                            this.uncheckedLinks--;
                            this.allUncheckedLinks--;
                            break;
                        case 'accepted':
                            this.acceptedLinks--;
                            this.allAcceptedLinks--;
                            break;
                        case 'rejected':
                            this.rejectedLinks--;
                            this.allRejectedLinks--;
                            break;
                        case 'uncertain':
                            this.uncertainLinks--;
                            this.allUncertainLinks--;
                            break;
                        case 'disputed':
                            this.disputedLinks--;
                            this.allDisputedLinks--;
                            break;
                    }

                    switch (after) {
                        case 'unchecked':
                            this.uncheckedLinks++;
                            this.allUncheckedLinks++;
                            break;
                        case 'accepted':
                            this.acceptedLinks++;
                            this.allAcceptedLinks++;
                            break;
                        case 'rejected':
                            this.rejectedLinks++;
                            this.allRejectedLinks++;
                            break;
                        case 'uncertain':
                            this.uncertainLinks++;
                            this.allUncertainLinks++;
                            break;
                    }

                    if ((this.currentIdx + 1) < this.links.length)
                        this.currentIdx++;

                    this.resetShownLinks = true;
                    await this.resetLinks('none', 'filtering');
                }
            },

            async validateSelection(validation) {
                this.isUpdating = true;
                this.isUpdatingSelection = true;

                const result = await this.$root.validateSelection(this.type, this.spec.id, validation, {
                    accepted: this.showAcceptedLinks,
                    rejected: this.showRejectedLinks,
                    uncertain: this.showUncertainLinks,
                    unchecked: this.showUncheckedLinks,
                    disputed: this.showDisputedLinks,
                    clusterIds: this.clusters,
                    min: this.similarityRange[0],
                    max: this.similarityRange[1]
                });

                this.isUpdating = false;
                this.isUpdatingSelection = false;

                if (result !== null)
                    await this.resetLinks('all', 'filtering');
            },

            async setMotivationForLink(link, motivation) {
                this.isUpdating = true;
                link.updating = true;

                const result = await this.$root.setMotivationForLink(
                    this.type, this.spec.id, motivation, link.source, link.target);

                this.isUpdating = false;
                link.updating = false;

                if (result !== null)
                    link.motivation = motivation;
            },

            async setMotivationForSelection() {
                this.isUpdating = true;
                this.isUpdatingSelection = true;

                const result = await this.$root.setMotivationForSelection(this.type, this.spec.id, this.motivation, {
                    accepted: this.showAcceptedLinks,
                    rejected: this.showRejectedLinks,
                    uncertain: this.showUncertainLinks,
                    unchecked: this.showUncheckedLinks,
                    disputed: this.showDisputedLinks,
                    clusterIds: this.clusters,
                    min: this.similarityRange[0],
                    max: this.similarityRange[1]
                });

                this.isUpdating = false;
                this.isUpdatingSelection = false;

                if (result !== null)
                    await this.resetLinks('reset', 'none');
            },
        },
        mounted() {
            document.addEventListener('keyup', this.onKey);
        },
        destroyed() {
            document.removeEventListener('keyup', this.onKey);
        },
    };
</script>
