<template>
<div class="tx-list">

    <template v-if="tx_list_paged.length === 0">
        <p class="q-pa-md q-mb-none">No transactions found</p>
    </template>

    <template v-else>
        <q-infinite-scroll :handler="loadMore" ref="scroller">
            <q-list link no-border :dark="theme=='dark'" class="triton-list tx-list">
                <q-item class="triton-list-item transaction" v-for="(tx) in tx_list_paged" :key="tx.txid"
                        @click.native="details(tx)" :class="'tx-'+tx.last_reward_block_height">
                    <q-item-side class="type">
                        <div>{{ Object.keys(tx.contributors).length }}</div>
                    </q-item-side>
                    <q-item-main class="main">
                        <q-item-tile class="amount" label>
                            <Formattriton :amount="tx.total_contribute+'/'+tx.staking_requirement" />
                        </q-item-tile>
                        <q-item-tile sublabel>{{ tx.operator_address }}</q-item-tile>
                    </q-item-main>
                    <q-item-side class="meta">
                        <q-item-tile label>
                            <timeago :datetime="tx.last_reward_transaction_index" :auto-update="60" />
                        </q-item-tile>
                        <q-item-tile sublabel>{tx.last_reward_block_height}</q-item-tile>
                    </q-item-side>
                </q-item>
                <q-spinner-dots slot="message" :size="40"></q-spinner-dots>
            </q-list>
        </q-infinite-scroll>
    </template>

    <TxDetails ref="txDetails" />

</div>
</template>

<script>
const { clipboard } = require("electron")
import { mapState } from "vuex"
import { QSpinnerDots } from "quasar"
// import Identicon from "components/identicon"
// import TxTypeIcon from "components/tx_type_icon"
import TxDetails from "components/tx_details"
import Formattriton from "components/format_triton"

export default {
    name: "TxList",
    props: {
        limit: {
            type: Number,
            required: false,
            default: -1
        },
        type: {
            type: String,
            required: false,
            default: "all"
        },
        txid: {
            type: String,
            required: false,
            default: ""
        },
        toOutgoingAddress: {
            type: String,
            required: false,
            default: ""
        },
        toIncomingAddressIndex: {
            type: Number,
            required: false,
            default: -1
        }
    },
    data () {
        return {
            page: 0,
            tx_list_filtered: [],
            tx_list_paged: []
        }
    },
    computed: mapState({
        theme: state => state.gateway.app.config.appearance.theme,
        current_height: state => state.gateway.daemon.info.height,
        wallet_height: state => state.gateway.wallet.info.height,
        tx_list: state => state.gateway.wallet.pools.pool_list
    }),
    created () {
        this.filterTxList()
        this.pageTxList()
    },
    watch: {
        wallet_height: {
            handler (val, old) {
                if (val === old) return
                this.filterTxList()
                this.pageTxList()
            }
        },
        tx_list: {
            handler (val, old) {
                // Check if anything changed in the tx list
                if (val.length === old.length) {
                    const changed = val.filter((v, i) => v.note !== old[i].note)
                    if (changed.length === 0) return
                }
                this.filterTxList()
                this.pageTxList()
            }
        },
        type: {
            handler (val, old) {
                if (val === old) return
                if (this.$refs.scroller) {
                    this.$refs.scroller.stop()
                    this.page = 0
                    this.$refs.scroller.reset()
                    this.$refs.scroller.resume()
                }
                this.filterTxList()
                this.pageTxList()
            }
        },
        txid: {
            handler (val, old) {
                if (val === old) return
                if (this.$refs.scroller) {
                    this.$refs.scroller.stop()
                    this.page = 0
                    this.$refs.scroller.reset()
                    this.$refs.scroller.resume()
                }
                this.filterTxList()
                this.pageTxList()
            }
        }
    },
    filters: {
        typeToString: function (value) {
            switch (value) {
            case "in":
                return "Received"
            case "out":
                return "Sent"
            case "failed":
                return "Failed"
            case "pending":
            case "pool":
                return "Pending"
            case "miner":
                return "Miner"
            case "snode":
                return "Service Node"
            case "stake":
                return "Stake"
            default:
                return "-"
            }
        }
    },
    methods: {
        filterTxList () {
            const all_in = ["in", "pool", "miner", "snode"]
            const all_out = ["out", "pending", "stake"]
            const all_pending = ["pending", "pool"]
            this.tx_list_filtered = this.tx_list.filter((tx) => {
                let valid = true

                if (this.type === "all_in" && !all_in.includes(tx.type)) {
                    return false
                }

                if (this.type === "all_out" && !all_out.includes(tx.type)) {
                    return false
                }

                if (this.type === "all_pending" && !all_pending.includes(tx.type)) {
                    return false
                }

                if (!this.type.startsWith("all") && this.type !== tx.type) {
                    valid = false
                    return valid
                }

                if (this.txid !== "") {
                    valid = tx.txid.toLowerCase().indexOf(this.txid.toLowerCase()) !== -1
                    return valid
                }

                if (this.toOutgoingAddress !== "") {
                    if (tx.hasOwnProperty("destinations")) {
                        valid = tx.destinations.filter((destination) => { return destination.address === this.toOutgoingAddress }).length
                    } else {
                        valid = false
                    }
                    return valid
                }

                if (this.toIncomingAddressIndex !== -1) {
                    valid = tx.hasOwnProperty("subaddr_index") && tx.subaddr_index.minor === this.toIncomingAddressIndex
                    return valid
                }

                return valid
            })
        },
        pageTxList () {
            // this.tx_list_paged = this.tx_list_filtered.slice(0, this.limit !== -1 ? this.limit : this.page * 24 + 24)
        },
        loadMore: function (index, done) {
            this.page = index
            if (this.limit !== -1 || this.tx_list_filtered.length < this.page * 24 + 24) {
                this.$refs.scroller.stop()
            }
            this.pageTxList()
            this.$nextTick(() => {
                done()
            })
        },
        details (tx) {
            // this.$refs.txDetails.tx = tx;
            // this.$refs.txDetails.txNotes = tx.note;
            // this.$refs.txDetails.isVisible = true;
        },
        formatHeight (tx) {
            // let height = tx.height;
            // let confirms = Math.max(0, this.wallet_height - height);
            // if(height == 0)
            //     return "Pending"
            // if(confirms < Math.max(10, tx.unlock_time - height))
            //     return `Height: ${height} (${confirms} confirm${confirms==1?'':'s'})`
            // else
            //     return `Height: ${height} (confirmed)`
        },
        copyTxid (txid, event) {
            event.stopPropagation()
            for (let i = 0; i < event.path.length; i++) {
                if (event.path[i].tagName === "BUTTON") {
                    event.path[i].blur()
                    break
                }
            }
            clipboard.writeText(txid)
            this.$q.notify({
                type: "positive",
                timeout: 1000,
                message: "Txid copied to clipboard"
            })
        },
        openExplorer (txid) {
            // this.$gateway.send("core", "open_explorer", {type: "tx", id: txid})
        }
    },
    components: {
        QSpinnerDots,
        // Identicon,
        // TxTypeIcon,
        TxDetails,
        Formattriton
    }
}
</script>

<style lang="scss">
.tx-list {
    .triton-list-item {
        padding-top: 0;
        padding-bottom: 0;
    }
    .transaction {
        .main {
            margin: 0;
            padding: 8px 10px;
            div {
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .type {

            div {
                min-width: 100px;
                margin-right: 8px;
            }
        }
    }
}
</style>
