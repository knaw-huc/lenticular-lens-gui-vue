import Vue from 'vue';

import BootstrapVue from 'bootstrap-vue';
import VueFormWizard from 'vue-form-wizard';
import VueMoment from 'vue-moment';

Vue.use(BootstrapVue);
Vue.use(VueFormWizard);
Vue.use(VueMoment);

import VSelect from 'vue-select'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

Vue.component('v-select', VSelect);
Vue.component('fa-icon', FontAwesomeIcon);

import ButtonAdd from './components/misc/ButtonAdd';
import ButtonDelete from './components/misc/ButtonDelete';
import ButtonInfo from './components/misc/ButtonInfo';
import SelectBox from './components/misc/SelectBox';
import Loading from './components/misc/Loading';
import Range from './components/misc/Range';
import Failed from './components/misc/Failed';
import Handle from './components/misc/Handle';
import Duration from './components/misc/Duration';
import Property from './components/helpers/Property';
import EtsProperty from './components/helpers/EtsProperty';
import DownloadProgress from './components/helpers/DownloadProgress';
import Card from './components/structural/Card';
import SubCard from './components/structural/SubCard';

Vue.component('button-add', ButtonAdd);
Vue.component('button-delete', ButtonDelete);
Vue.component('button-info', ButtonInfo);
Vue.component('select-box', SelectBox);
Vue.component('loading', Loading);
Vue.component('range', Range);
Vue.component('failed', Failed);
Vue.component('handle', Handle);
Vue.component('duration', Duration);
Vue.component('property', Property);
Vue.component('ets-property', EtsProperty);
Vue.component('download-progress', DownloadProgress);
Vue.component('card', Card);
Vue.component('sub-card', SubCard);

import {library} from '@fortawesome/fontawesome-svg-core';
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons';
import {
    faCopy, faChevronLeft, faChevronDown, faArrowRight, faPlus, faTrashAlt, faPencilAlt, faFilter, faCheck, faTimes,
    faInfoCircle, faAlignJustify, faProjectDiagram, faList, faCog, faGripHorizontal, faFileExport, faSync, faQuestion,
    faCheckSquare, faTextWidth, faExpandAlt, faCompressAlt, faSortNumericUp, faSortNumericDown, faBan
} from '@fortawesome/free-solid-svg-icons';

library.add(faQuestionCircle, faCopy, faChevronLeft, faChevronDown, faArrowRight, faPlus, faTrashAlt, faPencilAlt,
    faFilter, faBan, faCheck, faTimes, faInfoCircle, faAlignJustify, faProjectDiagram, faList, faCog, faGripHorizontal,
    faFileExport, faSync, faQuestion, faCheckSquare, faTextWidth, faExpandAlt, faCompressAlt,
    faSortNumericUp, faSortNumericDown);

import App from './App.vue';
import JobMixin from './mixins/JobMixin';

import './assets/app.scss';

new Vue({
    mixins: [JobMixin],
    render: h => h(App),
}).$mount('#app');
