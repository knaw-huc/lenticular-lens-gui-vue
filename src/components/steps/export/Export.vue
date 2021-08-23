<template>
  <card :id="'export_' + type + '_' + spec.id" type="export" :res-id="spec.id" :res-type="type" :label="spec.label"
        @show="onToggle(true)" @hide="onToggle(false)">
    <div class="row align-items-stretch justify-content-around">
      <sub-card label="Format" class="col-export">
        <div class="custom-control custom-switch mt-3">
          <input type="radio" class="custom-control-input" autocomplete="off"
                 :id="'export_csv_' + type + '_' + spec.id" value="csv"
                 v-model="format" @change="updateState('export_csv')"/>
          <label class="custom-control-label" :for="'export_csv_' + type + '_' + spec.id">
            CSV
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="radio" class="custom-control-input" autocomplete="off"
                 :id="'export_rdf_' + type + '_' + spec.id" value="rdf"
                 v-model="format" @change="updateState('export_rdf')"/>
          <label class="custom-control-label" :for="'export_rdf_' + type + '_' + spec.id">
            RDF (Trig)
          </label>
        </div>
      </sub-card>

      <sub-card label="Data" class="col-export">
        <div class="custom-control custom-switch mt-3">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_metadata_' + type + '_' + spec.id" :disabled="format === 'csv'"
                 v-model="exportMetadata" @change="updateState('export_metadata')"/>
          <label class="custom-control-label" :for="'export_metadata_' + type + '_' + spec.id">
            Metadata
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_linkset_' + type + '_' + spec.id" :disabled="format === 'csv'"
                 v-model="exportLinkset" @change="updateState('export_linkset')"/>
          <label class="custom-control-label" :for="'export_linkset_' + type + '_' + spec.id">
            Alignment
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_validation_set_' + type + '_' + spec.id" :disabled="format === 'csv'"
                 v-model="exportValidationSet" @change="updateState('export_validation_set')"/>
          <label class="custom-control-label" :for="'export_validation_set_' + type + '_' + spec.id">
            Validation set
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_cluster_set_' + type + '_' + spec.id" :disabled="format === 'csv' || !clustering"
                 v-model="exportClusterSet" @change="updateState('export_cluster_set')"/>
          <label class="custom-control-label" :for="'export_cluster_set_' + type + '_' + spec.id">
            Cluster set
          </label>
        </div>
      </sub-card>

      <sub-card label="Restrictions" class="col-export">
        <div class="custom-control custom-switch mt-3">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_all_links_' + type + '_' + spec.id"
                 v-model="exportAllLinks" @change="updateState('export_all_links')"/>
          <label class="custom-control-label" :for="'export_all_links_' + type + '_' + spec.id">
            All links
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_validated_links_' + type + '_' + spec.id"
                 v-model="exportValidatedLinks" @change="updateState('export_validated_links')"/>
          <label class="custom-control-label" :for="'export_validated_links_' + type + '_' + spec.id">
            Validated links
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_unchecked_links_' + type + '_' + spec.id"
                 v-model="exportUncheckedLinks" @change="updateState('export_unchecked_links')"/>
          <label class="custom-control-label" :for="'export_unchecked_links_' + type + '_' + spec.id">
            Unchecked links
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_accepted_links_' + type + '_' + spec.id"
                 v-model="exportAcceptedLinks" @change="updateState('export_accepted_links')"/>
          <label class="custom-control-label" :for="'export_accepted_links_' + type + '_' + spec.id">
            Accepted links
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_rejected_links_' + type + '_' + spec.id"
                 v-model="exportRejectedLinks" @change="updateState('export_rejected_links')"/>
          <label class="custom-control-label" :for="'export_rejected_links_' + type + '_' + spec.id">
            Rejected links
          </label>
        </div>

        <div v-if="isLens" class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_disputed_links_' + type + '_' + spec.id"
                 v-model="exportDisputedLinks" @change="updateState('export_disputed_links')"/>
          <label class="custom-control-label" :for="'export_disputed_links_' + type + '_' + spec.id">
            Disputed links
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" autocomplete="off"
                 :id="'export_uncertain_links_' + type + '_' + spec.id"
                 v-model="exportUncertainLinks" @change="updateState('export_uncertain_links')"/>
          <label class="custom-control-label" :for="'export_uncertain_links_' + type + '_' + spec.id">
            Uncertain links
          </label>
        </div>
      </sub-card>

      <sub-card label="RDF reification" class="col-export">
        <div class="custom-control custom-switch mt-3">
          <input type="radio" class="custom-control-input" autocomplete="off"
                 :id="'export_none_reif_' + type + '_' + spec.id" value="none" :disabled="format === 'csv'"
                 v-model="reification" @change="updateState('export_none_reif')"/>
          <label class="custom-control-label" :for="'export_none_reif_' + type + '_' + spec.id">
            No links metadata
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="radio" class="custom-control-input" autocomplete="off"
                 :id="'export_standard_reif_' + type + '_' + spec.id" value="standard" :disabled="format === 'csv'"
                 v-model="reification" @change="updateState('export_standard_reif')"/>
          <label class="custom-control-label" :for="'export_standard_reif_' + type + '_' + spec.id">
            Standard RDF reification
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="radio" class="custom-control-input" autocomplete="off"
                 :id="'export_rdf_star_reif_' + type + '_' + spec.id" value="rdf_star" :disabled="format === 'csv'"
                 v-model="reification" @change="updateState('export_rdf_star_reif')"/>
          <label class="custom-control-label" :for="'export_rdf_star_reif_' + type + '_' + spec.id">
            RDF*
          </label>
        </div>

        <div class="custom-control custom-switch">
          <input type="radio" class="custom-control-input" autocomplete="off"
                 :id="'export_singleton_reif_' + type + '_' + spec.id" value="singleton" :disabled="format === 'csv'"
                 v-model="reification" @change="updateState('export_singleton_reif')"/>
          <label class="custom-control-label" :for="'export_singleton_reif_' + type + '_' + spec.id">
            Singleton
          </label>
        </div>
      </sub-card>

      <sub-card label="RDF mappings" class="col-export">
        <div class="form-group mt-3">
          <label :for="`link_predicate_${type}_${spec.id}`">Link predicate:</label>

          <v-select :value="selectedLinkPredicate" :options="linkPredicatesList" class="form-control-sm p-0"
                    :id="`link_predicate_${type}_${spec.id}`" :clearable="false" :disabled="format === 'csv'"
                    autocomplete="off" placeholder="Select a link predicate" @input="selectLinkPredicate">
            <div slot="option" slot-scope="option">
              <div v-if="!option.predicate" class="text-secondary text-bold font-italic">
                Provide another link predicate
              </div>

              <template v-else>
                <div class="font-weight-bold">{{ option.label }}</div>
                <div class="text-muted text-wrap font-italic smaller pt-1">
                  {{ option.uri + option.predicate }}
                </div>
              </template>
            </div>
          </v-select>
        </div>

        <template v-if="!selectedLinkPredicate.predicate">
          <div class="form-group mt-3">
            <label :for="`link_predicate_prefix_${type}_${spec.id}`">Namespace:</label>

            <div class="input-group input-group-sm">
              <input type="text" class="form-control form-control-sm small-input" placeholder="Prefix"
                     :id="`link_predicate_prefix_${type}_${spec.id}`" v-model="prefix" :disabled="format === 'csv'"/>

              <input type="text" class="form-control form-control-sm" placeholder="URI"
                     :id="`link_predicate_uri_${type}_${spec.id}`" v-model="uri" :disabled="format === 'csv'"/>
            </div>
          </div>

          <div class="input-group input-group-sm mt-3">
            <div class="input-group-prepend">
              <span class="input-group-text">{{ prefix }}:</span>
            </div>

            <input type="text" class="form-control" placeholder="Link predicate"
                   v-model="predicate" :disabled="format === 'csv'"/>
          </div>
        </template>

        <button class="btn btn-sm btn-secondary mt-4" :disabled="format === 'csv'" @click="showPrefixMappings">
          Configure prefix mappings
        </button>
      </sub-card>

      <sub-card v-if="acceptCreator" label="RDF metadata" class="col-export">
        <div class="form-group mt-3">
          <label :for="`creator_${type}_${spec.id}`">Creator:</label>

          <input type="text" class="form-control form-control-sm" :id="`creator_${type}_${spec.id}`"
                 v-model="creator" :disabled="format === 'csv'"/>
        </div>
      </sub-card>
    </div>

    <div class="row justify-content-end align-items-center pt-3 mb-0">
      <div class="col-auto">
        <a class="btn btn-secondary" :href="exportLink" :download="`${type}_${spec.id}.${extension}`">Export</a>
      </div>
    </div>

    <prefix-mappings :type="type" :id="spec.id" ref="prefixMappings"/>
  </card>
</template>

<script>
    import props from "@/utils/props";
    import {isAuthEnabled} from "@/utils/config";
    import PrefixMappings from "./PrefixMappings";

    const linkPredicates = Object.values(props.linkPredicates)
        .flatMap(linkPredicateScope => linkPredicateScope.predicates.map(pred => ({
            label: `${linkPredicateScope.prefix}:${pred}`,
            prefix: linkPredicateScope.prefix,
            uri: linkPredicateScope.uri,
            predicate: pred
        })))
        .sort((lpA, lpB) => {
            const prefixCmp = lpA.prefix.localeCompare(lpB.prefix);
            if (prefixCmp === 0)
                return lpA.predicate.localeCompare(lpB.predicate);

            return prefixCmp;
        });

    linkPredicates.push({
        label: 'Provide another link predicate',
        prefix: null,
        uri: null,
        predicate: null
    });

    export default {
        name: "Export",
        components: {PrefixMappings},
        data() {
            return {
                isOpen: false,
                format: 'rdf',
                exportLinkset: true,
                exportMetadata: true,
                exportValidationSet: true,
                exportClusterSet: true,
                exportAllLinks: true,
                exportValidatedLinks: true,
                exportUncheckedLinks: true,
                exportAcceptedLinks: true,
                exportRejectedLinks: true,
                exportDisputedLinks: true,
                exportUncertainLinks: true,
                reification: 'standard',
                linkPredicatesList: linkPredicates,
                selectedLinkPredicate: linkPredicates[0],
                prefix: linkPredicates[0].prefix,
                uri: linkPredicates[0].uri,
                predicate: linkPredicates[0].predicate,
                creator: null,
            }
        },
        props: {
            type: String,
            spec: Object,
        },
        computed: {
            isLens() {
                return this.type === 'lens';
            },

            clustering() {
                const clustering = this.$root.clusterings.find(clustering =>
                    clustering.spec_type === this.type && clustering.spec_id === this.spec.id);
                if (clustering && clustering.status === 'done')
                    return clustering;

                return null;
            },

            extension() {
                if (this.format === 'csv')
                    return 'csv';

                return 'trig';
            },

            acceptCreator() {
                return !isAuthEnabled();
            },

            exportLink() {
                if (this.format === 'csv')
                    return this.getExportCsvLink();

                return this.getRdfExportLink();
            },
        },
        methods: {
            onToggle(isOpen) {
                this.isOpen = isOpen;
                isOpen ? this.$emit('show') : this.$emit('hide');
            },

            updateState(type) {
                switch (type) {
                    case 'export_csv':
                        this.exportMetadata = false;
                        this.exportValidationSet = false;
                        this.exportClusterSet = false;
                        this.exportLinkset = true;
                        this.reification = 'none';
                        break;
                    case 'export_linkset':
                        if (!this.exportLinkset)
                            this.reification = 'none'
                        if (!this.exportLinkset && !this.exportMetadata &&
                            !this.exportValidationSet && !this.exportClusterSet)
                            this.exportMetadata = true;
                        break;
                    case 'export_metadata':
                    case 'export_validation_set':
                    case 'export_cluster_set':
                        if (!this.exportLinkset && !this.exportMetadata &&
                            !this.exportValidationSet && !this.exportClusterSet)
                            this.exportLinkset = true;
                        break;
                    case 'export_all_links':
                        this.exportValidatedLinks = this.exportAllLinks;
                        this.exportUncheckedLinks = this.exportAllLinks;
                        this.exportAcceptedLinks = this.exportAllLinks;
                        this.exportRejectedLinks = this.exportAllLinks;
                        this.exportDisputedLinks = this.exportAllLinks;
                        this.exportUncertainLinks = this.exportAllLinks;
                        if (!this.exportAllLinks)
                            this.exportAcceptedLinks = true;
                        break;
                    case 'export_validated_links':
                        this.exportAcceptedLinks = this.exportValidatedLinks;
                        this.exportRejectedLinks = this.exportValidatedLinks;
                        this.exportDisputedLinks = this.exportValidatedLinks;
                        this.exportUncertainLinks = this.exportValidatedLinks;
                        this.exportAllLinks = this.exportValidatedLinks && this.exportUncheckedLinks;
                        if (!this.exportAllLinks)
                            this.exportUncheckedLinks = true;
                        break;
                    case 'export_unchecked_links':
                        this.exportAllLinks = this.exportValidatedLinks && this.exportUncheckedLinks;
                        if (!this.exportAllLinks)
                            this.exportValidatedLinks = true;
                        break;
                    case 'export_accepted_links':
                    case 'export_rejected_links':
                    case 'export_disputed_links':
                    case 'export_uncertain_links':
                        this.exportValidatedLinks = this.exportAcceptedLinks && this.exportRejectedLinks
                            && this.exportDisputedLinks && this.exportUncertainLinks;
                        if (!this.exportAllLinks)
                            this.exportUncheckedLinks = true;
                        break;
                }
            },

            selectLinkPredicate(linkPredicate) {
                this.selectedLinkPredicate = linkPredicate;
                this.prefix = linkPredicate.prefix;
                this.uri = linkPredicate.uri;
                this.predicate = linkPredicate.predicate;
            },

            showPrefixMappings() {
                this.$refs.prefixMappings.show();
            },

            getExportCsvLink() {
                const params = [];

                if (this.exportAcceptedLinks) params.push('valid=accepted');
                if (this.exportRejectedLinks) params.push('valid=rejected');
                if (this.exportDisputedLinks) params.push('valid=disputed');
                if (this.exportUncertainLinks) params.push('valid=uncertain');
                if (this.exportUncheckedLinks) params.push('valid=unchecked');

                return this.$root.getExportCsvLink(this.type, this.spec.id, params);
            },

            getRdfExportLink() {
                const params = [];

                params.push(`export_linkset=${this.exportLinkset}`);
                params.push(`export_metadata=${this.exportMetadata}`);
                params.push(`export_validation_set=${this.exportValidationSet}`);
                params.push(`export_cluster_set=${this.exportClusterSet}`);

                if (this.exportAcceptedLinks) params.push('valid=accepted');
                if (this.exportRejectedLinks) params.push('valid=rejected');
                if (this.exportDisputedLinks) params.push('valid=disputed');
                if (this.exportUncertainLinks) params.push('valid=uncertain');
                if (this.exportUncheckedLinks) params.push('valid=unchecked');

                params.push(`reification=${this.reification}`);

                params.push(`link_pred_namespace=${encodeURIComponent(this.uri)}`);
                params.push(`link_pred_shortname=${encodeURIComponent(this.prefix + ':' + this.predicate)}`);

                if (this.acceptCreator && this.creator) params.push(`creator=${encodeURIComponent(this.creator)}`);

                return this.$root.getExportRdfLink(this.type, this.spec.id, params);
            }
        },
    };
</script>
