<template>
  <b-modal size="xl" dialog-class="modal-full-size" hide-footer static
           @show="$emit('show')" @hide="$emit('hide')" ref="visualization">
    <template v-slot:modal-header="{close}">
      <h5 class="modal-title">{{ label }}</h5>

      <cluster-visualization-compact-info v-if="show === 'visualize-compact'"/>
      <cluster-visualization-reconciled-info v-else-if="show === 'visualize-reconciled'"/>
      <cluster-visualization-info v-else/>

      <div class="btn-group btn-group-toggle ml-auto">
        <label class="btn btn-sm btn-secondary" v-bind:class="{'active': show === 'visualize'}"
               @click="drawShown('visualize')">
          Cluster
        </label>

        <label class="btn btn-sm btn-secondary" v-bind:class="{'active': show === 'visualize-compact'}"
               @click="drawShown('visualize-compact')">
          Compact
        </label>
      </div>

      <button type="button" aria-label="Close" class="close modal-header-close" @click="close()">×</button>
    </template>

    <div class="plot" ref="plot">
      <div v-if="isLoading" class="row align-items-center justify-content-center">
        <div class="col-auto mt-4">
          <loading/>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
    import ClusterVisualizationInfo from '@/components/info/ClusterVisualizationInfo';
    import ClusterVisualizationCompactInfo from '@/components/info/ClusterVisualizationCompactInfo';
    import ClusterVisualizationReconciledInfo from '@/components/info/ClusterVisualizationReconciledInfo';

    import {draw} from '@/utils/visualization';

    export default {
        name: "ClusterVisualization",
        components: {
            ClusterVisualizationInfo,
            ClusterVisualizationCompactInfo,
            ClusterVisualizationReconciledInfo,
        },
        data() {
            return {
                show: null,
                clusterGraph: null,
                clusterGraphCompact: null,
                reconciliationGraph: null,
                isLoading: false,
            };
        },
        props: {
            type: String,
            specId: Number,
            clusterId: Number,
        },
        computed: {
            label() {
                switch (this.show) {
                    case 'visualize-compact':
                        return 'Visualization of Compact Cluster';
                    case 'visualize-reconciled':
                        return 'Visualization of Reconciled Cluster';
                    case 'visualize':
                    default:
                        return 'Visualization of Cluster';
                }
            },
        },
        methods: {
            showVisualization(show = null) {
                this.show = show || 'visualize-compact';
                this.$refs.visualization.show();
                this.$refs.visualization.$on('shown', _ => this.drawShown());
            },

            draw(graphParent) {
                draw(this.$refs.plot, graphParent);
            },

            async drawShown(show = null) {
                if (show)
                    this.show = show;

                if (!this.clusterGraph)
                    await this.getGraphData();

                switch (this.show) {
                    case 'visualize-compact':
                        if (this.clusterGraphCompact) this.draw(this.clusterGraphCompact);
                        break;
                    case 'visualize-reconciled':
                        if (this.reconciliationGraph) this.draw(this.reconciliationGraph);
                        break;
                    case 'visualize':
                    default:
                        if (this.clusterGraph) this.draw(this.clusterGraph);
                }
            },

            async getGraphData() {
                if (this.isLoading)
                    return;

                this.isLoading = true;

                const data = await this.$root.getClusterGraphs(this.type, this.specId, this.clusterId);

                this.clusterGraph = data.cluster_graph;
                this.clusterGraphCompact = data.cluster_graph_compact;
                this.reconciliationGraph = data.reconciliation_graph;

                this.isLoading = false;
            },
        },
        watch: {
            cluster() {
                this.clusterGraph = null;
                this.clusterGraphCompact = null;
                this.reconciliationGraph = null;

                const canvas = this.$refs.plot.getElementsByTagName('canvas');
                if (canvas.length > 0)
                    canvas[0].remove();
            },
        },
    };
</script>
