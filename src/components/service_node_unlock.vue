<template>
<div class="service-node-unlock">
     <div class="q-pa-md">
        <tritonField label="Service Node Key" :error="$v.node_key.$error" :disabled="unlock_status.sending">
            <q-input
                v-model="node_key"
                :dark="theme=='dark'"
                @blur="$v.node_key.$touch"
                placeholder="64 hexadecimal characters"
                :disabled="unlock_status.sending"
                hide-underline
            />
        </tritonField>
        <q-field class="q-pt-sm">
            <q-btn color="primary" @click="unlock()" label="Unlock service node" :disabled="unlock_status.sending"/>
        </q-field>
    </div>

    <q-inner-loading :visible="unlock_status.sending" :dark="theme=='dark'">
        <q-spinner color="primary" :size="30" />
    </q-inner-loading>
</div>
</template>

<script>
const objectAssignDeep = require("object-assign-deep")
import { mapState } from "vuex"
import { required } from "vuelidate/lib/validators"
import { service_node_key } from "src/validators/common"
import tritonField from "components/triton_field"
import WalletPassword from "src/mixins/wallet_password"

export default {
    name: "ServiceNodeUnlock",
    computed: mapState({
        theme: state => state.gateway.app.config.appearance.theme,
        unlock_status: state => state.gateway.service_node_status.unlock
    }),
    data () {
        return {
            node_key: ""
        }
    },
    validations: {
        node_key: { required, service_node_key }
    },
    watch: {
        unlock_status: {
            handler (val, old) {
                if (val.code === old.code) return
                switch (this.unlock_status.code) {
                case 0:
                    this.key = null
                    this.password = null

                    this.$q.notify({
                        type: "positive",
                        timeout: 1000,
                        message: this.unlock_status.message
                    })
                    this.$v.$reset()
                    this.node_key = ""
                    break
                case 1:
                    // Tell the user to confirm
                    this.$q.dialog({
                        title: "Confirm",
                        message: this.unlock_status.message,
                        ok: {
                            label: "UNLOCK",
                            color: "positive"

                        },
                        cancel: {
                            flat: true,
                            label: "CANCEL",
                            color: "red"
                        }
                    }).then(() => {
                        this.gatewayUnlock(this.password, this.key, true)
                    }).catch(() => {})
                    break
                case -1:
                    this.key = null
                    this.password = null

                    this.$q.notify({
                        type: "negative",
                        timeout: 1000,
                        message: this.unlock_status.message
                    })
                    break
                }
            },
            deep: true
        }
    },
    methods: {
        unlock: function () {
            this.$v.node_key.$touch()
            if (this.$v.node_key.$error) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Service node key not valid"
                })
                return
            }

            // We store this as it could change between the 2 step process
            this.key = this.node_key

            this.showPasswordConfirmation({
                title: "Unlock service node",
                noPasswordMessage: "Do you want to unlock the service node?",
                ok: {
                    label: "UNLOCK",
                    color: "positive"

                }
            }).then(password => {
                this.password = password
                this.gatewayUnlock(this.password, this.key, false)
            }).catch(() => {
            })
        },
        gatewayUnlock: function (password, key, confirmed = false) {
            this.$store.commit("gateway/set_snode_status", {
                unlock: {
                    code: 2, // Code 1 is reserved for can_unlock
                    message: "Unlocking...",
                    sending: true
                }
            })
            this.$gateway.send("wallet", "unlock_stake", {
                password,
                service_node_key: key,
                confirmed
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
