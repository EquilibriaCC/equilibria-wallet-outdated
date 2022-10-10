<template>
<q-page>

    <div class="row q-pt-sm q-mx-md q-mb-sm items-end non-selectable">

<!--            <tritonField class="col-3 q-px-sm " label="Balances">-->
<!--                <div style="  display: grid;grid-template-columns: 1fr 2fr">-->
<!--                    <p style="text-align: center; margin-top: auto">-->
<!--                        $100-->
<!--                    </p>-->
<!--                    <p style="text-align: right; margin-top: auto">-->
<!--                        350 XEQ-->
<!--                    </p>-->
<!--                </div>-->
<!--            </tritonField>-->

        <tritonField class="col-10 " label="Filter by txid">
            <q-input v-model="tx_txid"
                     :dark="theme=='dark'"
                     placeholder="TXID"
                     hide-underline
                     />
        </tritonField>

        <tritonField class="col-2" label="Filter by transaction type">
            <q-select :dark="theme=='dark'"
                      v-model="tx_type"
                      :options="tx_type_options"
                      hide-underline
                      />
        </tritonField>

    </div>
    <div class="row q-pt-sm q-mx-md q-mb-sm items-end non-selectable">

    <div class="col-1" style="margin-top: 25px">
        Transactions
    </div>
    </div>
    <TxList :type="tx_type" :txid="tx_txid" />
</q-page>
</template>

<script>
import { mapState } from "vuex"
import TxList from "components/tx_list"
import tritonField from "components/triton_field"
export default {
    data () {
        return {
            tx_type: "all",
            tx_txid: "",
            tx_type_options: [
                { label: "All", value: "all" },
                { label: "Incoming", value: "in" },
                { label: "Outgoing", value: "out" },
                { label: "Pending", value: "all_pending" },
                { label: "Miner", value: "miner" },
                { label: "Service Node", value: "snode" },
                { label: "Stake", value: "stake" },
                { label: "Failed", value: "failed" }
            ]

        }
    },
    computed: mapState({
        theme: state => state.gateway.app.config.appearance.theme,
        tx_list: state => state.gateway.wallet.transactions.tx_list
    }),

    components: {
        TxList,
        tritonField
    }

}
</script>

<style lang="scss">
</style>
