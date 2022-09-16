<template>
  <card :has-collapse="false">
    <div v-if="!loadingJobs" class="row justify-content-end align-items-center mb-4">
      <div v-if="!jobIdIsInList && (isLoading || isUploading || failed)" class="col-auto">
        <loading v-if="isLoading || isUploading"/>
        <failed v-else-if="failed" size="2x"/>
      </div>

      <div class="col-4">
        <div class="input-group">
          <input type="text"
                 class="form-control"
                 placeholder="Load research using ID"
                 v-model="idToLoad"
                 v-on:keyup.enter="$emit('load', idToLoad)"/>

          <div class="input-group-append">
            <button class="btn btn-secondary" @click="$emit('load', idToLoad)">Load</button>
          </div>
        </div>
      </div>

      <div class="col-4">
        <div class="input-group">
          <div class="custom-file">
            <input type="file" class="custom-file-input" id="file-config-upload" ref="fileUpload"/>

            <label class="custom-file-label text-muted" for="file-config-upload">
              Load research from configuration
            </label>
          </div>

          <div class="input-group-append">
            <button class="btn btn-secondary" @click="onFileUpload">Load</button>
          </div>
        </div>
      </div>

      <div class="col-auto">
        <button class="btn btn-secondary" @click="$emit('new')">New research</button>
      </div>
    </div>

    <loading v-if="loadingJobs"/>

    <div v-else-if="jobs.length === 0" class="text-muted text-center">
      You have no saved research projects yet!
    </div>

    <div v-else v-for="job in jobs" class="job-item border p-3 mt-2 bg-white">
      <div class="row align-items-center">
        <div class="col">
          <strong>{{ job.job_title }}</strong>

          <div class="smaller font-italic text-muted mt-1">
            {{ job.job_description }}
          </div>
        </div>

        <div v-if="job.job_id === jobId && (isLoading || failed)" class="col-auto">
          <loading v-if="isLoading" class="job-loading"/>
          <failed v-else-if="failed" size="2x"/>
        </div>

        <div class="col-auto">
          <div class="btn-group">
            <button class="btn btn-secondary" :disabled="isLoading" @click="$emit('load', job.job_id)">
              Load
            </button>

            <button class="btn btn-danger" :disabled="isLoading || job.role !== 'owner'" @click="onDelete(job.job_id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </card>
</template>

<script>
    export default {
        name: "ResearchList",
        data() {
            return {
                jobs: [],
                idToLoad: '',
                loadingJobs: true,
                isUploading: false,
            };
        },
        props: {
            jobId: String,
            isLoading: Boolean,
        },
        computed: {
            jobIdIsInList() {
                return this.jobs.find(job => job.job_id === this.jobId);
            },

            failed() {
                return !this.isLoading && this.jobId && !this.$root.job;
            },
        },
        methods: {
            async loadJobs() {
                this.loadingJobs = true;

                this.jobs = [];
                this.jobs = await this.$root.loadJobs();

                this.loadingJobs = false;
            },

            async onFileUpload() {
                try {
                    this.isUploading = true;

                    if (this.$refs.fileUpload.files.length > 0) {
                        const file = this.$refs.fileUpload.files[0];
                        const data = JSON.parse(await file.text());

                        if ('job_title' in data && 'job_description' in data) {
                            const jobId = await this.$root.createJob({
                                job_title: data.job_title,
                                job_description: data.job_description
                            });

                            await this.$root.updateJob({
                                job_id: jobId,
                                ...data
                            });

                            this.$emit('load', jobId);
                        }
                    }
                }
                finally {
                    this.isUploading = false;
                }
            },

            async onDelete(id) {
                if (confirm('Are you sure you want to delete this research?')) {
                    await this.$root.deleteJob(id);
                    await this.loadJobs();
                }
            },
        },
        async mounted() {
            await this.loadJobs();
        },
        updated: function () {
            this.$nextTick(_ => {
                if (this.isLoading) {
                    const elem = document.querySelector('.job-loading');
                    if (elem)
                        elem.closest('.job-item').scrollIntoView({behavior: 'smooth'});
                }
            });
        },
        watch: {
            jobId() {
                if (!this.loadingJobs && this.jobId && !this.jobIdIsInList && this.idToLoad !== this.jobId)
                    this.idToLoad = this.jobId;
            },
        },
    };
</script>