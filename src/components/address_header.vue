<template>
<q-item class="address-header">
    <q-item-main class="self-start">
        <q-item-tile sublabel class="title">{{ title }}</q-item-tile>
        <q-item-tile class="break-all" label>{{ address }}</q-item-tile>
        <q-item-tile v-if="payment_id" sublabel>Payment id: {{ payment_id }}</q-item-tile>
        <q-item-tile v-if="extra" sublabel class="extra">{{ extra }}</q-item-tile>
    </q-item-main>
    <q-item-side v-if="showCopy">
        <q-btn
            color="primary"
            style="width:25px;"
            size="sm" icon="file_copy"
            ref="copy"
            @click="copyAddress">
            <q-tooltip anchor="center left" self="center right" :offset="[5, 10]">
                Copy address
            </q-tooltip>
        </q-btn>

    </q-item-side>

    <q-context-menu>
        <q-list link separator style="min-width: 150px; max-height: 300px;">
            <q-item v-close-overlay
                    @click.native="copyAddress(/*address, $event*/)">
                <q-item-main label="Copy address" />
            </q-item>
        </q-list>
    </q-context-menu>

</q-item>
</template>

<script>
const { clipboard } = require("electron")
// import Identicon from "components/identicon"
export default {
    name: "AddressHeader",
    props: {
        title: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        payment_id: {
            type: String,
            required: false
        },
        extra: {
            type: String,
            required: false
        },
        showCopy: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data () {
        return {}
    },
    methods: {
        copyAddress () {
            this.$refs.copy.$el.blur()
            clipboard.writeText(this.address)
            if (this.payment_id) {
                this.$q.dialog({
                    title: "Copy address",
                    message: "There is a payment id associated with this address.\nBe sure to copy the payment id separately.",
                    ok: {
                        label: "OK",
                        color: "positive"
                    }
                }).then(() => {
                    this.$q.notify({
                        type: "positive",
                        timeout: 1000,
                        message: "Address copied to clipboard"
                    })
                }).catch(() => {
                    this.$q.notify({
                        type: "positive",
                        timeout: 1000,
                        message: "Address copied to clipboard"
                    })
                })
            } else {
                this.$q.notify({
                    type: "positive",
                    timeout: 1000,
                    message: "Address copied to clipboard"
                })
            }
        }
    },
    components: {
        // Identicon
    }
}
</script>

<style lang="scss">
.address-header {
    padding: 0;
    img {
        float:left;
        margin-right: 15px;
    }
    h3 {
        margin: 15px 0 0;
    }
    p {
        word-break: break-all;
    }
    &::after {
        content: "";
        clear: both;
        display: table;
    }

    .q-item-main {
        .q-item-label {
            font-weight: 400;
        }

        .q-item-sublabel, .q-list-header {
            font-size: 13px;
        }

        .title {
            font-size: 14px;
            margin-bottom: 2px;
        }

        .extra {
            margin-top: 8px;
        }
    }
}
</style>
