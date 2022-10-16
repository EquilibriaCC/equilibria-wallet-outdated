<template>
<q-page class="receive">
    <q-list link no-border :dark="theme=='dark'" class="triton-list">

        <q-list-header>My primary address</q-list-header>
        <q-list class="triton-list-item primary-address" no-border v-for="address in address_list.primary" :key="address.address" @click.native="details(address)">
            <q-item>
                <q-item-main>
                    <q-item-tile class="ellipsis" label>{{ address.address }}</q-item-tile>
                    <q-item-tile sublabel>Primary address</q-item-tile>
                </q-item-main>
                <q-item-side>
                    <q-btn
                        flat
                        style="width:25px;"
                        size="md"
                        @click="showQR(address.address, $event)"
                    >
                        <img src="statics/qr-code.svg" height="20" />
                        <q-tooltip anchor="bottom right" self="top right" :offset="[0, 5]">
                            Show QR code
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        flat
                        style="width:25px;"
                        size="md" icon="file_copy"
                        @click="copyAddress(address.address, $event)"
                    >
                        <q-tooltip anchor="bottom right" self="top right" :offset="[0, 5]">
                            Copy address
                        </q-tooltip>
                    </q-btn>
                </q-item-side>
            </q-item>
            <q-context-menu>
                <q-list link separator style="min-width: 150px; max-height: 300px;">
                    <q-item v-close-overlay
                            @click.native="details(address)">
                        <q-item-main label="Show details" />
                    </q-item>

                    <q-item v-close-overlay
                            @click.native="copyAddress(address.address, $event)">
                        <q-item-main label="Copy address" />
                    </q-item>
                </q-list>
            </q-context-menu>
        </q-list>

        <template v-if="address_list.used.length">
            <q-list-header>My used addresses</q-list-header>
            <q-list class="triton-list-item" no-border v-for="address in address_list.used" @click.native="details(address)" :key="address.address">
                <q-item>
                    <q-item-main>
                        <q-item-tile class="ellipsis" label>{{ address.address }}</q-item-tile>
                        <q-item-tile sublabel>Ssecondary {{ address.address_index }}</q-item-tile>
                    </q-item-main>
                    <q-item-side>
                        <q-btn
                            flat
                            style="width:25px;"
                            size="md"
                            @click="showQR(address.address, $event)"
                        >
                            <img src="statics/qr-code-grey.svg" height="20" />
                            <q-tooltip anchor="bottom right" self="top right" :offset="[0, 5]">
                                Show QR code
                            </q-tooltip>
                        </q-btn>
                        <q-btn
                            flat
                            style="width:25px;"
                            size="md" icon="file_copy"
                            @click="copyAddress(address.address, $event)">
                            <q-tooltip anchor="bottom right" self="top right" :offset="[5, 10]">
                                Copy address
                            </q-tooltip>
                        </q-btn>
                    </q-item-side>
                </q-item>
                <q-item-separator />
                <q-item class="info">
                    <q-item-main class="flex justify-between">
                        <div class="column">
                            <span>Balance</span>
                            <span class="value">{{ address.balance | currency }}</span>
                        </div>
                        <div class="column">
                            <span>Unlocked balance</span>
                            <span class="value">{{ address.unlocked_balance | currency }}</span>
                        </div>
                        <div class="column">
                            <span>Unspent outputs</span>
                            <span class="value">{{ address.num_unspent_outputs | toString }}</span>
                        </div>
                    </q-item-main>
                </q-item>

                <q-context-menu>
                    <q-list link separator style="min-width: 150px; max-height: 300px;">
                        <q-item v-close-overlay
                                @click.native="details(address)">
                            <q-item-main label="Show details" />
                        </q-item>

                        <q-item v-close-overlay
                                @click.native="copyAddress(address.address, $event)">
                            <q-item-main label="Copy address" />
                        </q-item>
                    </q-list>
                </q-context-menu>
            </q-list>
        </template>
<!--        {{showMessage}}-->

        <div v-if="!show"  style="margin-left: auto; width: 250px; margin-right: auto">
            <q-field class="q-pt-sm" >
                <q-btn style="margin-left: auto; width: 250px; margin-right: auto"
                       class="send-btn"
                       color="positive" @click.native="showUnused()" label="Show Secondary Addresses" />
            </q-field>
        </div>
        <div v-else  style="margin-left: auto; width: 250px; margin-right: auto">
            <q-field class="q-pt-sm" >
                <q-btn style="margin-left: auto; width: 250px; margin-right: auto"
                       class="send-btn"
                       color="positive" @click.native="showUnused()" label="Hide Secondary Addresses" />
            </q-field>
        </div>
        <template v-if="show" >
            <q-list class="triton-list-item" no-border v-for="address in address_list.unused" @click.native="details(address)" :key="address.address">
                <q-item>
                    <q-item-main>
                        <q-item-tile class="ellipsis" label>{{ address.address }}</q-item-tile>
                        <q-item-tile sublabel>Sub-address (Index {{ address.address_index }})</q-item-tile>
                    </q-item-main>
                    <q-item-side>
                        <q-btn
                            flat
                            style="width:25px;"
                            size="md"
                            @click="showQR(address.address, $event)"
                        >
                            <img src="statics/qr-code-grey.svg" height="20" />
                            <q-tooltip anchor="bottom right" self="top right" :offset="[0, 5]">
                                Show QR code
                            </q-tooltip>
                        </q-btn>
                        <q-btn
                            flat
                            style="width:25px;"
                            size="md" icon="file_copy"
                            @click="copyAddress(address.address, $event)">
                            <q-tooltip anchor="bottom right" self="top right" :offset="[5, 10]">
                                Copy address
                            </q-tooltip>
                        </q-btn>
                    </q-item-side>
                </q-item>

                <q-context-menu>
                    <q-list link separator style="min-width: 150px; max-height: 300px;">
                        <q-item v-close-overlay
                                @click.native="details(address)">
                            <q-item-main label="Show details" />
                        </q-item>

                        <q-item v-close-overlay
                                @click.native="copyAddress(address.address, $event)">
                            <q-item-main label="Copy address" />
                        </q-item>
                    </q-list>
                </q-context-menu>

           </q-list>
        </template>

    </q-list>
    <AddressDetails ref="addressDetails" />

    <!-- QR Code -->
    <template v-if="QR.address != null">
        <q-modal v-model="QR.visible" minimized :content-css="{padding: '25px'}">

            <div class="text-center q-mb-sm q-pa-md" style="background: white;">
                <qrcode-vue :value="QR.address" size="240" ref="qr">
                </qrcode-vue>
                <q-context-menu>
                    <q-list link separator style="min-width: 150px; max-height: 300px;">
                        <q-item v-close-overlay @click.native="copyQR()">
                            <q-item-main label="Copy QR code" />
                        </q-item>
                        <q-item v-close-overlay @click.native="saveQR()">
                            <q-item-main label="Save QR code to file" />
                        </q-item>
                    </q-list>
                </q-context-menu>
            </div>

            <q-btn
                 color="primary"
                 @click="QR.visible = false"
                 label="Close"
             />
        </q-modal>
    </template>
</q-page>
</template>

<script>

const { clipboard, nativeImage } = require("electron")
import { mapState } from "vuex"
import QrcodeVue from "qrcode.vue"
// import Identicon from "components/identicon"
import AddressDetails from "components/address_details"

export default {
    computed: mapState({
        theme: state => state.gateway.app.config.appearance.theme,
        address_list: state => state.gateway.wallet.address_list
    }),
    filters: {
        toString: function (value) {
            if (typeof value !== "number") return "N/A"
            return String(value)
        },
        currency: function (value) {
            if (typeof value !== "number") return "N/A"

            const amount = value / 1e4
            return amount.toLocaleString()
        }
    },
    data () {
        return {
            show: false,
            QR: {
                visible: false,
                address: null,
                show: false,
                showMessage: "Show Unused Addresses"
            }
        }
    },
    methods: {
        showUnused () {
            this.show = !this.show
            this.$forceUpdate()
        },
        details (address) {
            this.$refs.addressDetails.address = address
            this.$refs.addressDetails.isVisible = true
        },
        showQR (address, event) {
            event.stopPropagation()
            this.QR.visible = true
            this.QR.address = address
        },
        copyQR () {
            const data = this.$refs.qr.$el.childNodes[0].toDataURL()
            const img = nativeImage.createFromDataURL(data)
            clipboard.writeImage(img)
            this.$q.notify({
                type: "positive",
                timeout: 1000,
                message: "Copied QR code to clipboard"
            })
        },
        saveQR () {
            let img = this.$refs.qr.$el.childNodes[0].toDataURL()
            this.$gateway.send("core", "save_png", { img, type: "QR Code" })
        },
        copyAddress (address, event) {
            event.stopPropagation()
            for (let i = 0; i < event.path.length; i++) {
                if (event.path[i].tagName === "BUTTON") {
                    event.path[i].blur()
                    break
                }
            }
            clipboard.writeText(address)
            this.$q.notify({
                type: "positive",
                timeout: 1000,
                message: "Address copied to clipboard"
            })
        }
    },
    components: {
        // Identicon,
        AddressDetails,
        QrcodeVue
    }
}
</script>

<style lang="scss">
.receive {
    .q-item-label {
        font-weight: 400;
    }

    .q-item-sublabel, .q-list-header {
        font-size: 13px;
    }

    .triton-list-item {
        cursor: pointer;

        .q-item {
            padding-top: 4px;
            padding-bottom: 4px;
        }

        .q-item-side {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .info {
            span {
                font-size: 14px;
            }

             .value {
                font-size: 16px;
                font-weight: bold;
            }
        }
    }
}
</style>
