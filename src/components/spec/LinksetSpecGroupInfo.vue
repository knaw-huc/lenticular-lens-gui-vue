<template>
  <div class="spec-info border p-2" v-bind:class="styleClass">
    <p class="absolute-handle-right font-italic smaller border rounded bg-opacity pointer m-0 px-2"
       v-bind:class="borderStyleClass" @click="visible = !visible">
      <fa-icon icon="chevron-down" size="xs" :class="visible ? null : 'collapsed'"></fa-icon>
      {{ visible ? 'Close' : 'Open' }}
    </p>

    <b-collapse v-model="visible">
      <p v-if="isLinksetRoot" class="font-weight-bold mb-1">Matching</p>

      <template v-for="(condition, idx) in methodGroup.conditions">
        <linkset-spec-group-info v-if="condition.conditions"
                                 :method-group="condition" :key="idx" :is-root="false" :is-linkset-root="false"/>
        <linkset-spec-condition-info v-else :condition="condition" :using-fuzzy-logic="usingFuzzyLogic"/>

        <p v-if="idx < (methodGroup.conditions.length - 1) && usingFuzzyLogic" class="font-weight-bold my-2">
          <span class="text-secondary">
            {{ isConjunction ? 'AND' : 'OR' }}
          </span>
          using
          <span class="text-secondary">
            {{ {...tNorms, ...sNorms}[methodGroup.type] }}
          </span>
          <template v-if="methodGroup.threshold">
            having a threshold of
            <span class="text-secondary">{{ methodGroup.threshold }}</span>
          </template>
        </p>

        <p v-else-if="idx < (methodGroup.conditions.length - 1)" class="font-weight-bold my-2 text-secondary">
          {{ methodGroup.type }}
        </p>
      </template>
    </b-collapse>
  </div>
</template>

<script>
    import props from "@/utils/props";
    import LinksetSpecConditionInfo from './LinksetSpecConditionInfo';

    export default {
        name: "LinksetSpecGroupInfo",
        components: {
            LinksetSpecConditionInfo
        },
        props: {
            methodGroup: Object,
            isRoot: {
                type: Boolean,
                default: true,
            },
            addRootMargin: {
                type: Boolean,
                default: true,
            },
            isLinksetRoot: {
                type: Boolean,
                default: true,
            },
        },
        data() {
            return {
                tNorms: props.tNorms,
                sNorms: props.sNorms,
                visible: true,
            };
        },
        computed: {
            styleClass() {
                const styleClass = [];

                if (this.isRoot && this.addRootMargin)
                    styleClass.push('mt-3');

                if (this.isRoot || this.$parent.$parent.styleClass.includes('bg-primary-light'))
                    styleClass.push('bg-secondary-light', 'border-secondary');
                else
                    styleClass.push('bg-primary-light', 'border-primary');

                return styleClass;
            },

            borderStyleClass() {
                return this.styleClass.filter(className => className.startsWith('border'));
            },

            usingFuzzyLogic() {
                return !['and', 'or'].includes(this.methodGroup.type);
            },

            isConjunction() {
                return this.methodGroup.type === 'and' || Object.keys(this.tNorms).includes(this.methodGroup.type);
            },
        },
    }
</script>