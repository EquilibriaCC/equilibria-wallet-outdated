<template>
<div class="service-node-registration">
    <div class="q-pa-md">
        <div class="description q-mb-lg">
            Enter the <b>register_service_node</b> command produced by the daemon that is registering to become a Service Node using the "<b>prepare_registration</b>" command
        </div>
        <tritonField label="Service Node Command" :error="$v.registration_string.$error" :disabled="registration_status.sending">
            <q-input
                v-model="registration_string"
                type="textarea"
                :dark="theme=='dark'"
                @blur="$v.registration_string.$touch"
                placeholder="register_service_node ..."
                :disabled="registration_status.sending"
                hide-underline
            />
        </tritonField>
        <q-field class="q-pt-sm">
            <q-btn color="secondary" @click="register()" label="Register service node" :disabled="registration_status.sending"/>
        </q-field>
    </div>

    <q-inner-loading :visible="registration_status.sending" :dark="theme=='dark'">
        <q-spinner color="secondary" :size="30" />
    </q-inner-loading>
</div>
</template>

<script>
// const objectAssignDeep = require("object-assign-deep")
import { mapState } from "vuex"
import { required } from "vuelidate/lib/validators"
import tritonField from "components/triton_field"
import WalletPassword from "src/mixins/wallet_password"

export default {
    name: "ServiceNodeRegistration",
    computed: mapState({
        theme: state => state.gateway.app.config.appearance.theme,
        registration_status: state => state.gateway.service_node_status.registration
    }),
    data () {
        return {
            registration_string: ""
        }
    },
    validations: {
        registration_string: { required }
    },
    watch: {
        registration_status: {
            handler (val, old) {
                if (val.code === old.code) return
                switch (this.registration_status.code) {
                case 0:
                    this.$q.notify({
                        type: "positive",
                        timeout: 1000,
                        message: this.registration_status.message
                    })
                    this.$v.$reset()
                    this.registration_string = ""
                    break
                case -1:
                    this.$q.notify({
                        type: "negative",
                        timeout: 3000,
                        message: this.registration_status.message
                    })
                    break
                }
            },
            deep: true
        }
    },
    methods: {
        register: function () {
            this.$v.registration_string.$touch()

            if (this.$v.registration_string.$error) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Please enter the service node registration command"
                })
                return
            }

            this.showPasswordConfirmation({
                title: "Register service node",
                noPasswordMessage: "Do you want to register the service node?",
                ok: {
                    label: "REGISTER",
                    color: "positive"

                }
            }).then(password => {
                this.$store.commit("gateway/set_snode_status", {
                    registration: {
                        code: 1,
                        message: "Registering...",
                        sending: true
                    }
                })
                this.$gateway.send("wallet", "register_service_node", {
                    password,
                    string: this.registration_string
                })
            }).catch(() => {
            })
        }
    },
    mixins: [WalletPassword],
    components: {
        tritonField
    }
}
</script>

<style lang="scss">
</style>
