<template>
    <q-page>
        <div style="padding-bottom: 0px;">
            <div class="row justify-center" style="margin-bottom:0%;padding-bottom:0px">
                <h4 style="padding-bottom:0px;margin-bottom:0%;">Network Stats</h4>
            </div>
            <div class="row justify-center" style="padding-top:0px;margin-top:0%; width: 100%">
                <h5 style="padding-top:0px;margin:1%;text-align: left;">Total Nodes:
                    {{ (tx_list.length.toLocaleString()) }}
                </h5>
                <h5 style="padding-top:0px;margin:1%;text-align: justify;">Monthly Yield:
                    {{
                        Number((((720 / tx_list.length) * 5.4 * 30) / (tx_list[0].staking_requirement / 1e4) * 100).toFixed(2)).toLocaleString()
                    }}%</h5>
                <h5 style="padding-top:0px;margin:1%;text-align: justify;"> Monthly Reward:
                    {{ (Number(((720 / tx_list.length) * 5.4) * 30)).toLocaleString() }} XEQ
                </h5>
                <h5 style="padding-top:0px;margin:1%;text-align: justify;">
                    TVL: ${{ Number(conversionFromXtri(getTVL())).toLocaleString() }}
                </h5>
            </div>
        </div>
        <div v-if="stake_data.total_staked" style="padding-bottom: 0px;">
            <div class="row justify-center" style="margin-bottom:0%;padding-bottom:0px">
                <h4 style="padding-bottom:0px;margin-bottom:0%;">Account Stats</h4>
            </div>
            <div class="row justify-center" style="padding-top:0px;margin-top:0%; width: 100%">

                <h5 style="padding-top:0px;margin:1%;text-align: justify;">Total Staked:
                    {{
                        (stake_data.total_staked / (10 ** 4)).toLocaleString()
                    }}</h5>
                <h5 style="padding-top:0px;margin:1%;text-align: justify;">Percentage of Pool:
                    {{
                        ((stake_data.total_staked / (10 ** 4)) / getTVL() * 100).toLocaleString()
                    }}%</h5>
                <h5 style="padding-top:0px;margin:1%;text-align: justify;">Monthly Reward:
                    {{
                        ((stake_data.total_staked / (10 ** 4)) / getTVL() * (Number(((720 / tx_list.length) * 5.4) * 30))).toLocaleString()
                    }} XEQ</h5>
                <!--                <h5 style="padding-top:0px;margin:1%;text-align: left;">Daily Earnings:-->
                <!--                    {{ ((daily_reward / (10 ** 4)).toLocaleString()) }}-->
                <!--                </h5>-->
                <h5 style="padding-top:0px;margin:1%;text-align: justify;"> Nodes Staked To:
                    {{ stake_data.staked_nodes.length }}
                </h5>
                <h5 style="padding-top:0px;margin:1%;text-align: justify;"> Nodes Operating:
                    {{ num_operating }}
                </h5>
                <!--                <h5 style="padding-top:0px;margin:1%;text-align: justify;">-->
                <!--                    Estimated Earnings for Period:-->
                <!--                    ${{ (this.current_price * this.earnings_for_period / (10 ** 4)).toLocaleString() }} |-->
                <!--                    {{ (this.earnings_for_period / (10 ** 4)).toLocaleString() }} XEQ-->
                <!--                </h5>-->
            </div>
        </div>

        <div v-if="staked_pools.length != 0" class="row justify-center" style="margin-bottom:0%;padding-bottom:0px">
            <h4 style="padding-bottom:0px;margin-bottom:0%;">Staked Pools</h4>
        </div>
        <div v-if="staked_pools.length != 0" class="row q-pt-sm q-mx-md q-mb-sm items-end non-selectable">
            <div style="padding-top: 5px; margin-left: auto; margin-right: auto" class="tx-list">
                <div class="row justify-center">
                    <div v-for="item in staked_pools" :key="item.service_node_pubkey">
                        <div class="col-2" style="padding: 4%; ">
                            <div
                                style="background-color: #222222; border-radius: 5px;margin:auto; padding: 50px;padding-top:5px;padding-bottom:5px; -webkit-box-shadow: 0px 0px 21px -1px #005BC6;
box-shadow: 0px 0px 21px -1px #005BC6">
                                <h6 class="type" style="color:white">
                                    Oracle Node ID: <br/>{{
                                        item.service_node_pubkey.substring(0, 4)
                                    }}...{{
                                        item.service_node_pubkey.substring(item.service_node_pubkey.length - 5, item.service_node_pubkey.length - 1)
                                    }}
                                </h6>
                                <p class="main" style="color:white">
                                    Stakers: {{
                                        (item.contributors.length).toLocaleString()
                                    }} <br/>
                                    Lockup: {{
                                        getLockTime(item.registration_height)
                                    }}<br/>
                                    Staked: {{
                                        (item.amount / 10000).toLocaleString()
                                    }} XEQ<br/>
                                    Equity: {{
                                        (((item.amount) / item.total_contributed) * 100).toLocaleString()
                                    }}%<br/>
                                    Available: {{
                                        ((item.staking_requirement / 10000) - (item.total_contributed / 10000)).toLocaleString()
                                    }} XEQ<br/>
                                </p>

                                <div v-if="isFull(item)">
                                    <q-field class="q-pt-sm">
                                        <q-btn style="background-color: #005BC6"
                                               class="send-btn"
                                               color="positive"
                                               @click="handleClick(item.service_node_pubkey, item.operator_address, (item.staking_requirement - item.total_contributed)/10000)"
                                               label="Stake"/>
                                    </q-field>
                                </div>
                                <div v-if="!isFull(item.contributors)">

                                    <div style="padding-bottom: 75px"/>
                                </div>

                            </div>
                        </div>

                        <div style="padding-top: 5px"/>
                    </div>
                </div>
            </div>
        </div>

        <div class="row justify-center" style="margin-bottom:0%;padding-bottom:0px">
            <h4 style="padding-bottom:0px;margin-bottom:0%;">Oracle Node Pools</h4>
        </div>
        <div class="row q-pt-sm q-mx-md q-mb-sm items-end non-selectable">
            <div style="padding-top: 5px;" class="tx-list">
                <div class="row justify-center">
                    <div v-for="item in tx_list" :key="item.service_node_pubkey">
                        <div v-if="isFull(item)" class="col-2" style="padding: 4%;">
                            <div
                                style="background-color: #222222; border-radius: 5px;margin:auto; padding: 50px;padding-top:5px;padding-bottom:5px">
                                <h6 class="type" style="color:white">
                                    Oracle Node ID: {{
                                        item.service_node_pubkey.substring(0, 4)
                                    }}...{{
                                        item.service_node_pubkey.substring(item.service_node_pubkey.length - 5, item.service_node_pubkey.length - 1)
                                    }}
                                </h6>
                                <p class="main" style="color:white">
                                    <!--                                    Stakers: {{-->
                                    <!--                                        (item.contributors.length).toLocaleString()-->
                                    <!--                                    }} <br/>-->
                                    Available: {{
                                        ((item.staking_requirement / 10000) - (item.total_contributed / 10000)).toLocaleString()
                                    }} XEQ<br/>
                                    <!--                                    Operator Fee : {{-->
                                    <!--                                        (((item.portions_for_operator / 18446744073709551612) * 100)).toLocaleString()-->
                                    <!--                                    }}% <br/>-->
                                    Lock Time: {{
                                        getLockTime(item.registration_height)
                                    }}</br>
                                    Requirement: {{ 100 }} XEQ
                                </p>

                                <div v-if="isFull(item)">
                                    <q-field class="q-pt-sm">
                                        <q-btn style="background-color: #005BC6"
                                               class="send-btn"
                                               color="positive"
                                               @click="handleClick(item.service_node_pubkey, item.operator_address, (item.staking_requirement - item.total_contributed)/10000)"
                                               label="Stake"/>
                                    </q-field>
                                </div>
                                <div v-if="!isFull(item.contributors)">

                                    <div style="padding-bottom: 75px"/>
                                </div>

                            </div>
                        </div>

                        <div style="padding-top: 5px"/>
                    </div>
                </div>
            </div>
        </div>
        <q-modal v-model="openedSend" minimized content-css="padding: 0 2rem 2rem 2rem" class="confirmBtn"
                 style="border-radius: 15px">
            <h5>CONFIRM AMOUNT TO STAKE</h5>
            <p>Oracle ID: {{ oracleKey }}</p>
            <p v-if="unlocked_balance / 1e4 > maxAmount">Max Amount: {{ maxAmount }}</p>
            <p v-else>Max Amount: {{ (unlocked_balance / 1e4).toLocaleString() }}</p>
            <p>Minimum Amount: {{ 100 }}</p>

            <tritonField label="Amount">
                <q-input
                    v-model="stake_amount"
                    type="number"
                    min="0"
                    :max="maxAmount"
                    placeholder="0"
                    hide-underline
                />
                <q-btn color="positive" @click="stake_amount = unlocked_balance / 1e4"
                       :text-color="theme=='dark'?'white':'dark'">Max
                </q-btn>

            </tritonField>

            <div style="margin-left: auto; margin-right: auto;padding-top: 10px">
                <q-btn v-if="unlocked_balance / 1e4 >= 100"
                       style="background-color: #005BC6"
                       class="send-btn"
                       color="positive" @click="stake(), openedSend = false" label="Confirm Stake"/>
                <q-btn v-else
                       style="background-color: #db1010; cursor: not-allowed;"
                       class="send-btn"
                       label="Not Enough Coins"/>
            </div>
        </q-modal>

    </q-page>
</template>

<script>
import { mapState } from "vuex"
import TxList from "components/pools_list"
import tritonField from "components/triton_field"
import WalletPassword from "src/mixins/wallet_password"
import axios from "axios"
import VueToggles from "vue-toggles"

export default {
    data () {
        return {
            tx_type: "all",
            tx_txid: "",
            status: "Not Joined",
            openedSend: false,
            oracleKey: "",
            oracleAddress: "",
            maxAmount: "",
            stake_amount: "",
            num_nodes_staked_to: 0,
            tvl: 0,
            daily_reward: 0,
            stake_data: {},
            staked_pools: [],
            stake_transactions: {},
            next_unlock: 0,
            earnings_for_period: 0,
            keys: [],
            total_stake_amount: 0,
            total_xeq_earning_p_d: 0,
            current_price: 0,
            num_operating: 0,
            newTx: {
                amount: 0,
                address: "",
                payment_id: "",
                priority: 0,
                currency: 0,
                address_book: {
                    save: false,
                    name: "",
                    description: ""
                }
            },
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
        tx_list: state => state.gateway.wallet.pools.pool_list,
        tx_status: state => state.gateway.tx_status,
        unlocked_balance: state => state.gateway.wallet.info.unlocked_balance,
        info: state => state.gateway.wallet.info,
        state: state => state
    }),

    components: {
        TxList,
        tritonField
    },
    mounted () {
        let stake_data = this.state.gateway.wallet.staker.stake

        if (!stake_data) return
        let user_pools = []
        let n_op = 0
        this.tx_list.map(item => {
            stake_data.staked_nodes.map(node => {
                if (item.service_node_pubkey === node.node_key) {
                    user_pools.push({ ...item, ...node })
                }
            })
        })
        user_pools.map(node => {
            if (node.is_operator) { n_op++ }
        })
        this.num_operating = n_op
        this.staked_pools = user_pools
        fetch("https://api.coingecko.com/api/v3/coins/triton?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false\n")
            .then(response => response.json())
            .then(data => {
                this.current_price = data.market_data.current_price.usd
                this.$forceUpdate()
            })
        this.stake_data = stake_data
        this.total_stake_amount = stake_data.total_staked_amount
        this.num_nodes_staked_to = stake_data.total_nodes_staked_to
        this.next_unlock = stake_data.lowest_unlock_time_by_block
        this.daily_reward = (720 / stake_data.total_nodes) * (stake_data.reward) * ((stake_data.total_staked_amount / stake_data.total_nodes_staked_to) / stake_data.avg_staking_req)
        this.earnings_for_period = this.daily_reward * ((stake_data.avg_unlock_time - stake_data.avg_reg_height) / 720)
    },
    watch: {
        stake_status: {
            handler (val, old) {
                if (val.code === old.code) return
                switch (this.stake_status.code) {
                case 0:
                    this.$q.notify({
                        type: "positive",
                        timeout: 10000,
                        message: this.stake_status.message
                    })
                    this.$v.$reset()
                    this.service_node = {
                        key: "",
                        amount: 0,
                        award_address: ""
                    }
                    break
                case -1:
                    this.$q.notify({
                        type: "negative",
                        timeout: 10000,
                        message: this.stake_status.message
                    })
                    break
                }
            },
            deep: true
        },
        tx_status: {
            handler (val, old) {
                // if(val.code == old.code) return
                switch (this.tx_status.code) {
                case 0:
                    this.$q.dialog({
                        title: "Confirm Fee",
                        message: this.tx_status.message,
                        ok: {
                            label: "OK",
                            color: "positive"

                        },
                        cancel: {
                            flat: true,
                            label: "CANCEL",
                            color: "red"
                        }
                    }).then(() => {
                        this.$gateway.send("wallet", "stake_confirm", {})
                    }).catch(() => {
                        this.$gateway.send("wallet", "stake_cancel", {})
                    })
                    break
                case -1:

                    break
                }
            },
            deep: true
        }
    },
    methods: {
        isFull: function (item) {
            return item.total_contributed < item.staking_requirement
        },
        myShare: function (contrib) {
            let sum_of_my_stake = 0
            for (let i = 0; i < contrib.length; i++) {
                if (this.info.address === contrib[i].address) {
                    sum_of_my_stake += contrib[i].amount
                    // if (this.stake_transactions[key] == undefined) {
                    //     this.stake_transactions[key] = contrib[i].amount;
                    //     this.keys.push_back(key);
                    // }
                }
            }
            return sum_of_my_stake
        },
        isMine: function (contrib) {
            for (let i = 0; i < contrib.length; i++) {
                if (this.info.address === contrib[i].address) { return true }
            }

            return false
        },
        conversionFromXtri: function (amount) {
            // xtri price in sats variable
            let sats
            // btc prices in differnt currencies
            let currentPrice
            let prices = []
            // let dollar_amount = 0
            // getting xtri price in sats from Trade Ogre
            axios.get("https://tradeogre.com/api/v1/ticker/BTC-XEQ").then(res => {
                sats = res.data.price

                // getting btc price in usd
                axios.get("https://blockchain.info/ticker").then(res => {
                    // btc prices in difffernt gov currencys
                    prices[0] = res.data.USD["15m"]
                    prices[1] = res.data.AUD["15m"]
                    prices[2] = res.data.BRL["15m"]
                    prices[3] = res.data.CAD["15m"]
                    prices[4] = res.data.CHF["15m"]
                    prices[5] = res.data.CLP["15m"]
                    prices[6] = res.data.CNY["15m"]
                    prices[7] = res.data.DKK["15m"]
                    prices[8] = res.data.EUR["15m"]
                    prices[9] = res.data.GBP["15m"]
                    prices[10] = res.data.HKD["15m"]
                    prices[11] = res.data.INR["15m"]
                    prices[12] = res.data.ISK["15m"]
                    prices[13] = res.data.JPY["15m"]
                    prices[14] = res.data.KRW["15m"]
                    prices[15] = res.data.NZD["15m"]
                    prices[16] = res.data.PLN["15m"]
                    prices[17] = res.data.RUB["15m"]
                    prices[18] = res.data.SEK["15m"]
                    prices[19] = res.data.SGD["15m"]
                    prices[20] = res.data.THB["15m"]
                    prices[21] = res.data.TWD["15m"]
                    currentPrice = prices[0]

                    // Do conversion with current currency
                    this.tvl = ((amount * currentPrice) * sats).toFixed(0)
                })
            })

            return this.tvl
        },
        getLockTime (height) {
            if ((height + 20160) - this.info.height < 30) {
                return Math.round(((height + 20160) - this.info.height) / 2).toString() + " minutes"
            } else if ((height + 20160) - this.info.height < 720) {
                return Math.round(((height + 20160) - this.info.height) / 30).toString() + " hours"
            } else {
                return Math.round(((height + 20160) - this.info.height) / 720).toString() + " days"
            }
        },
        getTVL: function () {
            let sum_xeq_staked = 0
            for (var i = 0; i < this.tx_list.length; i++) {
                sum_xeq_staked += this.tx_list[i].total_contributed
            }

            return sum_xeq_staked / 1e4
        },
        handleClick: function (key, address, maxAmount) {
            this.oracleKey = key
            this.oracleAddress = address
            this.maxAmount = maxAmount
            this.openedSend = true
        },
        stake: function (key, address, amount) {
            this.showPasswordConfirmation({
                title: "Stake",
                noPasswordMessage: "Do you want to stake?",
                ok: {
                    label: "STAKE",
                    color: "positive"

                }
            }).then(password => {
                this.$store.commit("gateway/set_tx_status", {
                    code: 1,
                    message: "Sending transaction",
                    sending: true
                })

                this.$gateway.send("wallet", "stake", {
                    password: password,
                    amount: this.stake_amount,
                    key: this.oracleKey,
                    destination: this.info.address
                })
            }).catch(() => {
            })
        }
    },
    mixins: [WalletPassword]

}
</script>

<style lang="scss">
</style>
