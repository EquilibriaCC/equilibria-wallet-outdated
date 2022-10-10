<template>
<q-modal v-model="isVisible" maximized class="address-book-details">

    <q-modal-layout v-if="mode == 'edit' || mode == 'new'">
        <q-toolbar slot="header" color="dark" inverted>
            <q-btn flat round dense icon="reply" @click="close()" />
            <q-toolbar-title v-if="mode=='new'">
                Add address book entry
            </q-toolbar-title>
            <q-toolbar-title v-else-if="mode=='edit'">
                Edit address book entry
            </q-toolbar-title>

            <q-btn v-if="mode=='edit'" color="red flat no-ripple" @click="cancelEdit()" label="Cancel" />
            <q-btn class="q-ml-sm" color="primary" @click="save()" label="Save" />

        </q-toolbar>
        <div class="address-book-modal q-mx-md">
            <tritonField label="Address" :error="$v.newEntry.address.$error">
                <q-input
                    v-model="newEntry.address"
                    :placeholder="address_placeholder"
                    @blur="$v.newEntry.address.$touch"
                    :dark="theme=='dark'"
                    hide-underline
                    />
                <q-checkbox
                    v-model="newEntry.starred"
                    checked-icon="star"
                    unchecked-icon="star_border"
                    class="star-entry"
                    dark
                    />
            </tritonField>
            <tritonField label="Name">
                <q-input
                    v-model="newEntry.name"
                    :dark="theme=='dark'"
                    hide-underline
                    />
            </tritonField>
            <tritonField label="Payment ID" :error="$v.newEntry.payment_id.$error" optional>
                <q-input
                    v-model="newEntry.payment_id"
                    placeholder="16 or 64 hexadecimal characters"
                    @blur="$v.newEntry.payment_id.$touch"
                    :dark="theme=='dark'"
                    hide-underline
                    />
            </tritonField>
            <tritonField label="Notes" optional>
                <q-input
                    v-model="newEntry.description"
                    placeholder="Additional notes"
                    type="textarea"
                    :dark="theme=='dark'"
                    hide-underline
                    />
            </tritonField>

            <q-field v-if="mode=='edit'">
                <q-btn class="float-right" color="red" @click="deleteEntry()" label="Delete" />
            </q-field>
        </div>
    </q-modal-layout>

    <q-modal-layout v-else>
        <q-toolbar slot="header" color="dark" inverted>
            <q-btn flat round dense icon="reply" @click="close()" />
            <q-toolbar-title>
                Address book details
            </q-toolbar-title>
            <q-btn class="q-mr-sm"
                   flat no-ripple
                   :disable="!is_ready"
                   @click="edit()" label="Edit" />
            <q-btn
                color="primary"
                :disabled="view_only"
                @click="sendToAddress"
                label="Send coins" />
        </q-toolbar>
        <div class="layout-padding">

            <template v-if="entry != null">

                <AddressHeader :address="entry.address"
                               :title="entry.name"
                               :payment_id="entry.payment_id"
                               :extra="entry.description ? 'Notes: '+entry.description : ''"
                               />

                <div class="q-mt-lg">

                    <div class="non-selectable">
                        <q-icon name="history" size="24px" />
                        <span class="vertical-middle q-ml-xs">Recent transactions with this address</span>
                    </div>

                    <TxList type="all_in" :limit="5" :to-outgoing-address="entry.address" :key="entry.address"/>

                </div>

            </template>

        </div>
    </q-modal-layout>

</q-modal>
</template>

<script>
import { mapState } from "vuex"
// import Identicon from "components/identicon"
import AddressHeader from "components/address_header"
import TxList from "components/tx_list"
import tritonField from "components/triton_field"
import { payment_id, address } from "src/validators/common"
import { required } from "vuelidate/lib/validators"
export default {
    name: "AddressBookDetails",
    data () {
        return {
            isVisible: false,
            entry: null,
            mode: "view",
            newEntry: {
                index: false,
                address: "",
                payment_id: "",
                name: "",
                description: "",
                starred: false
            }
        }
    },
    computed: mapState({
        theme: state => state.gateway.app.config.appearance.theme,
        view_only: state => state.gateway.wallet.info.view_only,
        is_ready (state) {
            return this.$store.getters["gateway/isReady"]
        },
        address_placeholder (state) {
            const wallet = state.gateway.wallet.info
            const prefix = (wallet && wallet.address && wallet.address[0]) || "L"
            return `${prefix}..`
        }
    }),
    validations: {
        newEntry: {
            address: {
                required,
                isAddress (value) {
                    if (value === "") return true

                    return new Promise(resolve => {
                        address(value, this.$gateway)
                            .then(() => resolve(true))
                            .catch(e => resolve(false))
                    })
                }
            },
            payment_id: { payment_id }
        }
    },
    methods: {
        save () {
            this.$v.newEntry.$touch()

            if (this.$v.newEntry.address.$error) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Address not valid"
                })
                return
            }

            if (this.$v.newEntry.payment_id.$error) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Payment id not valid"
                })
                return
            }

            this.$gateway.send("wallet", "add_address_book", this.newEntry)
            this.close()
        },
        deleteEntry () {
            this.$gateway.send("wallet", "delete_address_book", this.newEntry)
            this.close()
        },
        sendToAddress () {
            this.close()
            this.$router.replace({ path: "send", query: { address: this.entry.address, payment_id: this.entry.payment_id } })
        },
        edit () {
            this.mode = "edit"
            this.newEntry = this.entry
        },
        cancelEdit () {
            this.mode = "view"
            this.$v.$reset()
            this.newEntry = {
                index: false,
                address: "",
                payment_id: "",
                name: "",
                description: "",
                starred: false
            }
        },
        close () {
            this.isVisible = false
            this.$v.$reset()
            this.newEntry = {
                index: false,
                address: "",
                payment_id: "",
                name: "",
                description: "",
                starred: false
            }
        }
    },

    components: {
        AddressHeader,
        // Identicon,
        TxList,
        tritonField
    }
}
</script>

<style lang="scss">
.address-book-details {

    .address-book-modal {
        > .triton-field {
            margin-top: 16px;
        }

        .star-entry {
            padding: 4px;
        }
    }
}
</style>
