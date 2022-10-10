<template>
<div class="column wallet-info">
    <div style="border-bottom: 1px solid white;"/>
    <div class="wallet-content">
        <div class="row justify-center">
            <div class="funds column items-center">
                <div class="balance">
                    <div v-if="price != 0" class="value">$<span><Formattriton :amount="info.balance * price" /></span></div>
                    <div v-else class="value"><span><Formattriton :amount="info.balance" /> XEQ</span></div>
                </div>
                <div v-if="price != 0" class="row unlocked">
                    <span><Formattriton :amount="info.balance" /> XEQ</span>
                </div>
                <div v-if="info.balance != info.unlocked_balance" class="row unlocked">
                    <span>Unlocked: <Formattriton :amount="info.unlocked_balance" /> XEQ</span>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
const { clipboard } = require("electron")
import { mapState } from "vuex"
import Formattriton from "components/format_triton"
import WalletSettings from "components/wallet_settings"
export default {
    name: "WalletDetails",
    computed: mapState({
        theme: state => state.gateway.app.config.appearance.theme,
        info: state => state.gateway.wallet.info
    }),
    data () {
        return {
            price: 0
        }
    },
    mounted () {
        fetch("https://api.coingecko.com/api/v3/coins/triton?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false\n")
            .then(response => response.json())
            .then(data => {
                this.price = data.market_data.current_price.usd
                this.$forceUpdate()
            })
    },
    methods: {
        copyAddress () {
            this.$refs.copy.$el.blur()
            clipboard.writeText(this.info.address)
            this.$q.notify({
                type: "positive",
                timeout: 1000,
                message: "Address copied to clipboard"
            })
        }
    },
    components: {
        Formattriton,
        WalletSettings
    }
}
</script>

<style lang="scss">
.wallet-info {
    .wallet-header {
        padding: 0.8rem 1.5rem;
        .title {
            font-weight: bold;
        }
    }

    .wallet-content {
        text-align: center;
        background-color: #0A0A0A;
        padding: 2em;

        .balance {
            .text {
                font-size: 16px;
            }
            .value {
                font-size: 35px;
            }
        }

         .wallet-address {
            margin-top: 12px;
            .address {
                overflow: hidden;
                text-overflow: ellipsis;
                margin: 4px 0;
            }
            .q-btn {
                margin-left: 8px;
            }
        }

        .unlocked {
            font-size: 14px;
            font-weight: 500;
        }
    }
}
</style>
