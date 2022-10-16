<template>
    <q-layout view="hHh Lpr lFf">
        <q-layout-header style="border-bottom: 1px solid white; margin: 10px">
            <div class="flex items-center justify-center" style="margin-top:10px; padding-bottom: 20px">
                <div style="padding-left: auto; padding-right: auto; padding-top: auto; padding-bottom: auto;">
                    <div class="funds column items-center">
                        <div class="balance">
                            <div v-if="price != 0" class="value" style="font-size: 30px">$<span><Formattriton
                                :amount="info.balance * price"/></span></div>
                            <div v-else class="value"><span><Formattriton :amount="info.balance"/> XEQ</span></div>
                        </div>
                        <div v-if="price != 0" class="row unlocked">
                            <span><Formattriton :amount="info.balance"/> XEQ</span>
                        </div>
                        <div v-if="info.balance != info.unlocked_balance" class="row unlocked">
                            <span>Temporarily Locked: <Formattriton :amount="info.balance - info.unlocked_balance"/> XEQ</span>
                        </div>
                    </div>
                </div>
            </div>
            <main-menu/>

            <div>
                <div class="menu q-focus-helper" style="margin-top: 5px; top: 0px; left: 0px; position: absolute; opacity: 1 !important; margin: 10px">
                    <img src="statics/xeq_logo_with_padding.png" height="60">

                </div>
            </div>
        </q-layout-header>

        <q-page-container>
            <!-- <AddressHeader :address="info.address" :title="info.name" /> -->
            <!--        <WalletDetails />-->

            <div class="app-content" style="margin-top: 15px">
                <div class="navigation row items-end">
                    <router-link to="/wallet">
                        <q-btn
                            class="large-btn primary"
                            label="Transactions"
                            size="md"
                            icon-right="swap_horiz"
                            align="left"
                        />
                    </router-link>
                    <router-link to="/wallet/send">
                        <q-btn
                            class="large-btn primary"
                            label="Send"
                            size="md"
                            icon-right="arrow_right_alt"
                            align="left"
                        />
                    </router-link>
                    <router-link to="/wallet/receive">
                        <q-btn
                            class="large-btn"
                            label="Receive"
                            size="md"
                            icon-right="save_alt"
                            align="left"
                        />
                    </router-link>
                    <!-- <router-link to="/wallet/swap">
                        <q-btn
                            class="large-btn primary"
                            label="wXEQ"
                            size="md"
                            icon-right="arrow_right_alt"
                            align="left"
                        />
                    </router-link> -->
                    <router-link to="/wallet/staking-pools">
                        <q-btn
                            class="large-btn primary"
                            label="Staking Pools"
                            size="md"
                            icon-right="arrow_right_alt"
                            align="left"
                        />
                    </router-link>
<!--                    <router-link to="/wallet/service-node">-->
<!--                        <q-btn-->
<!--                            class="large-btn primary"-->
<!--                            label="Node Reg"-->
<!--                            size="md"-->
<!--                            icon-right="arrow_right_alt"-->
<!--                            align="left"-->
<!--                        />-->
<!--                    </router-link>-->
                    <router-link to="/wallet/addressbook">
                        <q-btn
                            class="large-btn primary"
                            label="Address Book"
                            size="md"
                            icon-right="person"
                        />
                    </router-link>
                    <div class="address">
                        <WalletSettings/>

                    </div>

                </div>
                <div class="hr-separator"/>
                <keep-alive>
                    <router-view/>
                </keep-alive>
            </div>
        </q-page-container>

        <status-footer/>

    </q-layout>
</template>

<script>
// const { clipboard } = require("electron")
import { openURL } from "quasar"
import { mapState } from "vuex"
// import WalletDetails from "components/wallet_details"
import Formattriton from "components/format_triton"
import WalletSettings from "components/wallet_settings"
import StatusFooter from "components/footer"
import MainMenu from "components/mainmenu"

export default {
    name: "LayoutDefault",
    computed: mapState({
        theme: state => state.gateway.app.config.appearance.theme,
        info: state => state.gateway.wallet.info
    }),
    data () {
        return {
            selectedTab: "tab-1",
            price: 0

        }
    },
    mounted () {
        fetch("https://api.coingecko.com/api/v3/coins/triton?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false\n")
            .then(response => response.json())
            .then(data => {
                if (data && data.error) {
                    this.price = 0
                } else {
                    this.price = data.market_data.current_price.usd
                }
                this.$forceUpdate()
            })
    },
    methods: {
        openURL
    },
    components: {
        StatusFooter,
        MainMenu,
        // WalletDetails,
        WalletSettings,
        Formattriton
    }
}
</script>

<style lang="scss">
.navigation {
    padding: 8px 12px;

    > * {
        margin: 2px 0;
        margin-right: 12px;
    }

    > *:last-child {
        margin-right: 0px;
    }

    .address {
        margin-left: auto;
    }

    .single-icon {
        width: 38px;
        padding: 0;
    }

    .large-btn {
        width: 180px;

        .q-btn-inner > *:last-child {
            margin-left: auto;
        }

    }
}

</style>
