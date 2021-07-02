<template>
  <div class="spec-info border p-2" v-bind:class="styleClass">
    <p class="absolute-handle-right font-italic smaller border rounded bg-opacity pointer m-0 px-2"
       v-bind:class="borderStyleClass" @click="visible = !visible">
      <fa-icon icon="chevron-down" size="xs" :class="visible ? null : 'collapsed'"></fa-icon>
      {{ visible ? 'Close' : 'Open' }}
    </p>

    <b-collapse v-model="visible">
      <lens-spec-group-info v-if="!specLeft" :elements-group="elementsGroupLeft" :is-root="false"/>

      <lens-spec-group-info v-else-if="elementsGroupLeft.type === 'lens'" :elements-group="specLeft.specs"
                            :is-root="false"/>

      <linkset-spec-group-info v-else :method-group="specLeft.methods" :is-root="false" :is-linkset-root="true"/>

      <p class="font-weight-bold my-2">
        using a lens type of
        <span class="text-secondary">{{ elementsGroup.type }}</span>
        <template v-if="elementsGroup.t_conorm">
          and a t-conorm of
          <span class="text-secondary">{{ tConorms[elementsGroup.type] }}</span>
        </template>
        <template v-if="elementsGroup.threshold">
          having a threshold of
          <span class="text-secondary">{{ elementsGroup.threshold }}</span>
        </template>
        against
      </p>

      <lens-spec-group-info v-if="!specRight" :elements-group="elementsGroupRight" :is-root="false"/>

      <lens-spec-group-info v-else-if="elementsGroupRight.type === 'lens'" :elements-group="specRight.specs"
                            :is-root="false"/>

      <linkset-spec-group-info v-else :method-group="specRight.methods" :is-root="false" :is-linkset-root="true"/>
    </b-collapse>
  </div>
</template>

<script>
    import props from '@/utils/props';
    import LinksetSpecGroupInfo from './LinksetSpecGroupInfo';

    export default {
        name: "LensSpecGroupInfo",
        components: {
            LinksetSpecGroupInfo
        },
        props: {
            isRoot: {
                type: Boolean,
                default: true,
            },
            addRootMargin: {
                type: Boolean,
                default: true,
            },
            elementsGroup: Object,
        },
        data() {
            return {
                tConorms: props.tConorms,
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

            elementsGroupLeft() {
                return this.getElementsGroup(0);
            },

            elementsGroupRight() {
                return this.getElementsGroup(1);
            },

            specLeft() {
                return this.getSpec(0);
            },

            specRight() {
                return this.getSpec(1);
            },
        },
        methods: {
            getElementsGroup(index) {
                return this.elementsGroup.elements[index];
            },

            getSpec(index) {
                const elementsGroup = this.getElementsGroup(index);
                if (elementsGroup.hasOwnProperty('id') && elementsGroup.hasOwnProperty('type')) {
                    if (elementsGroup.type === 'linkset')
                        return this.$root.getLinksetSpecById(elementsGroup.id);

                    return this.$root.getLensSpecById(elementsGroup.id);
                }

                return null;
            },
        },
    }
</script>