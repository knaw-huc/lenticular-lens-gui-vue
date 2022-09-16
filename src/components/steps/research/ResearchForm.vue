<template>
  <card :has-collapse="false">
    <div v-if="jobId" class="form-group mb-3">
      <label class="h4" for="jobIdCopy">Research ID</label>
      <div class="row m-0">
        <input type="text" class="form-control col-md-3" id="jobIdCopy"
               ref="jobIdCopy" disabled v-model="jobId"/>

        <div class="col-auto">
          <button class="btn btn-secondary" @click="copyToClipboard()">
            <fa-icon icon="copy"/>
          </button>

          <span class="badge badge-secondary ml-3" ref="clipboardCopyMessage" hidden>
            Research ID copied to clipboard
          </span>
        </div>
      </div>
    </div>

    <div class="form-group mb-3">
      <label class="h4" for="research">Research Question</label>
      <textarea class="form-control" id="research" v-model="title"
                v-bind:class="{'is-invalid': errors.includes('title')}" :disabled="isUpdating"></textarea>
      <small class="form-text text-muted mt-2">
        Write here your main research question
      </small>
      <div class="invalid-feedback" v-show="errors.includes('title')">
        Please indicate your research question
      </div>
    </div>

    <div class="form-group mb-3">
      <label class="h4" for="description">Hypothesis</label>
      <textarea class="form-control" id="description" v-model="description"
                v-bind:class="{'is-invalid': errors.includes('description')}" :disabled="isUpdating"></textarea>
      <small class="form-text text-muted mt-2">
        Describe here your expectations and possibly your sub-research questions
      </small>
      <div class="invalid-feedback" v-show="errors.includes('description')">
        Please indicate what your research is about
      </div>
    </div>

    <div class="form-group mb-3">
      <label class="h4" for="link">Link</label>
      <input type="text" class="form-control" id="link" v-model="link" :disabled="isUpdating">
      <small class="form-text text-muted mt-2">
        Provide a link to the paper if this work gets published
      </small>
    </div>

    <div class="form-group row justify-content-end align-items-center mb-0">
      <div class="col-auto" v-if="$root.job">
          <span class="badge badge-secondary" v-show="$root.job.created_at !== $root.job.updated_at">
            Updated {{ $root.job.updated_at | moment("MMMM Do YYYY, HH:mm:ss") }}
          </span>
      </div>

      <div class="col-auto">
        <button class="btn btn-secondary" @click="saveResearch">
          {{ $root.job ? 'Update' : 'Create' }}
        </button>
      </div>

      <div v-if="jobId" class="col-auto">
        <a class="btn btn-secondary" :download="jobId + '.json'" :href="downloadHref">
          Download configuration
        </a>
      </div>
    </div>
  </card>
</template>

<script>
    import ValidationMixin from "@/mixins/ValidationMixin";

    export default {
        name: "ResearchForm",
        mixins: [ValidationMixin],
        data() {
            return {
                title: '',
                description: '',
                link: '',
            };
        },
        props: {
            jobId: String,
            jobTitle: String,
            jobDescription: String,
            jobLink: String,
            isUpdating: Boolean,
        },
        computed: {
            downloadHref() {
                return 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
                    job_title: this.$root.job.job_title,
                    job_description: this.$root.job.job_description,
                    job_link: this.$root.job.job_link,
                    entity_type_selections: this.$root.job.entity_type_selections,
                    linkset_specs: this.$root.job.linkset_specs,
                    lens_specs: this.$root.job.lens_specs,
                    views: this.$root.job.views,
                }));
            },
        },
        methods: {
            copyToClipboard() {
                navigator.clipboard.writeText(this.jobId);

                this.$refs.clipboardCopyMessage.removeAttribute('hidden');
                setTimeout(() => this.$refs.clipboardCopyMessage.setAttribute('hidden', 'hidden'), 2000);
            },

            validateResearch() {
                const ideaValid = this.validateField('title', this.title);
                const descriptionValid = this.validateField('description', this.description);
                return ideaValid && descriptionValid;
            },

            saveResearch() {
                if (this.validateResearch()) {
                    const event = this.$root.job ? 'update' : 'create';
                    this.$emit(event, {
                        job_id: this.$root.job ? this.jobId : undefined,
                        job_title: this.title,
                        job_description: this.description,
                        job_link: this.link,
                    });
                }
            },
        },
        mounted() {
            if (this.jobTitle)
                this.title = this.jobTitle;
            if (this.jobDescription)
                this.description = this.jobDescription;
            if (this.jobLink)
                this.link = this.jobLink;
        },
        watch: {
            jobTitle() {
                if (this.jobTitle)
                    this.title = this.jobTitle;
            },

            jobDescription() {
                if (this.jobDescription)
                    this.description = this.jobDescription;
            },

            jobLink() {
                if (this.jobLink)
                    this.link = this.jobLink;
            },
        },
    };
</script>