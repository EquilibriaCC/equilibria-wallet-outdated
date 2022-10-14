<template>
<q-page padding class="created">
    <div class="col wallet q-mb-lg">
        <h6>{{walletName}}</h6>
        <div class="row items-center">
            <div class="col address">
                {{ info.address }}
            </div>
            <div class="q-item-side">
                <q-btn
                    color="primary" style="width:25px;"
                    size="sm" icon="file_copy"
                    @click="copyAddress(info.address, $event)">
                    <q-tooltip anchor="center left" self="center right" :offset="[5, 10]">
                        Copy address
                    </q-tooltip>
                </q-btn>
            </div>
        </div>
    </div>

    <template v-if="secret.mnemonic">
        <div class="seed-box col">
            <h6 class="q-mb-xs q-mt-lg">Seed words</h6>
            <div class="seed q-my-lg">
                {{ secret.mnemonic }}
            </div>
            <div class="q-my-md warning">
                Please copy and save these in a secure location!
            </div>
            <div>
                <q-btn
                    color="primary"
                    size="md"
                    icon="file_copy"
                    label="Copy seed words"
                    @click="copyPrivateKey('mnemonic', $event)"
                />
            </div>
        </div>
    </template>

    <q-collapsible label="Advanced" header-class="q-mt-sm non-selectable row reverse advanced-options-label">
        <template v-if="secret.view_key != secret.spend_key">
            <h6 class="q-mb-xs title">View key</h6>
            <div class="row">
                <div class="col" style="word-break:break-all;">
                    {{ secret.view_key }}
                </div>
                <div class="q-item-side">
                    <q-btn
                        color="primary" style="width:25px;"
                        size="sm" icon="file_copy"
                        @click="copyPrivateKey('view_key', $event)">
                        <q-tooltip anchor="center left" self="center right" :offset="[5, 10]">
                            Copy view key
                        </q-tooltip>
                    </q-btn>
                </div>
            </div>
        </template>

        <template v-if="!/^0*$/.test(secret.spend_key)">
            <h6 class="q-mb-xs title">Spend key</h6>
            <div class="row">
                <div class="col" style="word-break:break-all;">
                    {{ secret.spend_key }}
                </div>
                <div class="q-item-side">
                    <q-btn
                        color="primary" style="width:25px;"
                        size="sm" icon="file_copy"
                        @click="copyPrivateKey('spend_key', $event)">
                        <q-tooltip anchor="center left" self="center right" :offset="[5, 10]">
                            Copy spend key
                        </q-tooltip>
                    </q-btn>
                </div>
            </div>
        </template>
    </q-collapsible>

    <q-btn class="q-mt-lg" color="primary" @click="open" label="Open Account" />

</q-page>
</template>

<script>
const { clipboard } = require("electron")
import { mapState } from "vuex"
// import AddressHeader from "components/address_header"
export default {
    computed: mapState({
        info: state => state.gateway.wallet.info,
        secret: state => state.gateway.wallet.secret,
        walletName (state) {
            return `Wallet: ${this.info.name}`
        }
    }),
    methods: {
        open () {
            setTimeout(() => {
                this.$store.commit("gateway/set_wallet_data", {
                    secret: {
                        mnemonic: "",
                        spend_key: "",
                        view_key: ""
                    }
                })
            }, 500)
            this.$router.replace({ path: "/wallet" })
        },
        copyAddress (address, event) {
            event.stopPropagation()
            for (let i = 0; i < event.path.length; i++) {
                console.log(event.path[i].tagName)
                if (event.path[i].tagName === "BUTTON") {
                    event.path[i].blur()
                    break
                }
            }
            clipboard.writeText(address)

            this.$q.dialog({
                title: "Copy address",
                message: "Be careful who you send your private keys to as they control your funds.",
                ok: {
                    label: "OK",
                    color: "positive"

                }
            }).then(() => {
                this.$q.notify({
                    type: "positive",
                    timeout: 1000,
                    message: "address copied to clipboard"
                })
            }).catch(() => {
                this.$q.notify({
                    type: "positive",
                    timeout: 1000,
                    message: "address copied to clipboard"
                })
            })
        },
        copyPrivateKey (type, event) {
            event.stopPropagation()
            for (let i = 0; i < event.path.length; i++) {
                console.log(event.path[i].tagName)
                if (event.path[i].tagName === "BUTTON") {
                    event.path[i].blur()
                    break
                }
            }

            if (this.secret[type] == null) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Error copying private key"
                })
                return
            }

            clipboard.writeText(this.secret[type])
            let type_human = type.substring(0, 1).toUpperCase() + type.substring(1).replace("_", " ")

            this.$q.dialog({
                title: "Copy " + type_human,
                message: "Be careful who you send your private keys to as they control your funds.",
                ok: {
                    label: "OK",
                    color: "positive"

                }
            }).then(() => {
                this.$q.notify({
                    type: "positive",
                    timeout: 1000,
                    message: type_human + " copied to clipboard"
                })
            }).catch(() => {
                this.$q.notify({
                    type: "positive",
                    timeout: 1000,
                    message: type_human + " copied to clipboard"
                })
            })
        }
    },
    components: {
        // AddressHeader
    }

}
</script>

<style lang="scss">
.created {
    .wallet h6 {
        text-align: center;
    }

    .address {
        text-align: center;
        word-break: break-all;
    }

    .seed-box {
        border: 1px solid white;
        border-radius: 3px;
        margin: 16px;
        padding: 16px;

        div, h6 {
            text-align: center;
        }

        .seed {
            font-size: 24px;
            text-transform: uppercase;
            font-weight: 600;
        }

        .warning {
            color: goldenrod;
        }
    }
    h6 {
        font-size: 18px;
        margin: 8px 0;
        font-weight: 450;
    }
    .advanced-options-label {
        padding-left: 0;
        padding-right: 0;
    }
}
</style>
