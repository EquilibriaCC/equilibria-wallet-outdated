import { Daemon } from "./daemon"
import { WalletRPC } from "./wallet-rpc"
import { SCEE } from "./SCEE-Node"
import { dialog } from "electron"

let fetch = require("isomorphic-unfetch")
const WebSocket = require("ws")
const os = require("os")
const fs = require("fs-extra")
const path = require("upath")
const objectAssignDeep = require("object-assign-deep")
const execSync = require("child_process").execSync

Promise.allSettled = Promise.allSettled || ((promises) => Promise.all(
    promises.map(p => p
        .then(value => ({
            status: "fulfilled",
            value
        }))
        .catch(reason => ({
            status: "rejected",
            reason
        }))
    )
))

export class Backend {
    constructor (mainWindow) {
        this.mainWindow = mainWindow
        this.daemon = null
        this.walletd = null
        this.wss = null
        this.token = null
        this.config_dir = null
        this.wallet_dir = null
        this.config_file = null
        this.config_data = {}
        this.scee = new SCEE()
    }

    init (config) {
        if (os.platform() === "win32") {
            this.config_dir = "C:\\ProgramData\\equilibria"
            this.wallet_dir = `${os.homedir()}\\Documents\\equilibria`
        } else {
            this.config_dir = path.join(os.homedir(), ".equilibria")
            this.wallet_dir = path.join(os.homedir(), "equilibria")
        }

        if (!fs.existsSync(this.config_dir)) {
            fs.mkdirSync(this.config_dir, { recursive: true })
        }

        if (!fs.existsSync(path.join(this.config_dir, "gui"))) {
            fs.mkdirSync(path.join(this.config_dir, "gui"), { recursive: true })
        }

        this.config_file = path.join(this.config_dir, "gui", "config.json")

        const daemon = {
            type: "remote",
            p2p_bind_ip: "0.0.0.0",
            p2p_bind_port: 9230,
            rpc_bind_ip: "127.0.0.1",
            rpc_bind_port: 9231,
            zmq_rpc_bind_ip: "127.0.0.1",
            zmq_rpc_bind_port: 9233,
            out_peers: -1,
            in_peers: -1,
            limit_rate_up: -1,
            limit_rate_down: -1,
            log_level: 0
        }

        const daemons = {
            mainnet: {
                ...daemon,
                remote_host: "154.38.165.93",
                remote_port: 9231
            },
            stagenet: {
                ...daemon,
                type: "local",
                p2p_bind_port: 9230,
                rpc_bind_port: 9231,
                zmq_rpc_bind_port: 9232
            },
            testnet: {
                ...daemon,
                type: "local",
                p2p_bind_port: 9330,
                rpc_bind_port: 9331,
                zmq_rpc_bind_port: 9332
            }
        }

        // Default values
        let port
        try {
            port = JSON.parse(fs.readFileSync(path.join(this.config_dir, "gui", "port.json", "utf8"))).port
        } catch {
            port = 10231
        }
        this.defaults = {
            daemons: objectAssignDeep({}, daemons),
            app: {
                data_dir: this.config_dir,
                wallet_data_dir: this.wallet_dir,
                ws_bind_port: port,
                net_type: "mainnet"
            },
            wallet: {
                rpc_bind_port: 9999,
                log_level: 0
            }
        }

        this.config_data = {
            // Copy all the properties of defaults
            ...objectAssignDeep({}, this.defaults),
            appearance: {
                theme: "dark"
            }
        }
        // this is too long
        if (this.config_data.app.scan === undefined) {
            this.config_data.app.scan = false
        }

        let remotes
        try {
            remotes = fs.readFileSync(path.join(this.config_dir, "gui", "remotes.json"), "utf8")
        } catch {
            remotes = JSON.stringify([
                {
                    "host": "equilibria.fastnode.eu",
                    "port": 9231
                },
                {
                    "host": "xeq.supporters.ml",
                    "port": 9231
                },
                {
                    "host": "xeq.gntl.uk",
                    "port": 9231
                },
                {
                    "host": "154.38.165.93",
                    "port": 9231
                }

            ], null, 4)
            fs.writeFile(path.join(this.config_dir, "gui", "remotes.json"), remotes, "utf8", () => {

            })
        }
        this.remotes = JSON.parse(remotes)

        this.token = config.token

        this.wss = new WebSocket.Server({
            port: config.port,
            maxPayload: Number.POSITIVE_INFINITY
        })

        this.wss.on("connection", ws => {
            ws.on("message", data => this.receive(data))
        })
    }

    send (event, data = {}) {
        let message = {
            event,
            data
        }

        let encrypted_data = this.scee.encryptString(JSON.stringify(message), this.token)

        this.wss.clients.forEach(function each (client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(encrypted_data)
            }
        })
    }

    receive (data) {
        let decrypted_data = JSON.parse(this.scee.decryptString(data, this.token))

        // route incoming request to either the daemon, wallet, or here
        switch (decrypted_data.module) {
        case "core":
            this.handle(decrypted_data)
            break
        case "daemon":
            if (this.daemon) {
                this.daemon.handle(decrypted_data)
            }
            break
        case "wallet":
            if (this.walletd) {
                this.walletd.handle(decrypted_data)
            }
            break
        }
    }

    handle (data) {
        let params = data.data

        switch (data.method) {
        case "quick_save_config":
            // save only partial config settings
            Object.keys(params).map(key => {
                this.config_data[key] = Object.assign(this.config_data[key], params[key])
            })
            fs.writeFile(this.config_file, JSON.stringify(this.config_data, null, 4), "utf8", () => {
                this.send("set_app_data", {
                    config: params,
                    pending_config: params
                })
            })
            break
        case "change_remotes":
            this.remotes = params
            fs.writeFile(path.join(this.config_dir, "gui", "remotes.json"), JSON.stringify(params), "utf8", () => {
                this.send("set_app_data", {
                    remotes: params
                })
            })
            break
        case "change_scan":
            this.config_data.app.scan = params
            this.send("set_app_data", {
                scan: params
            })
            break

        case "save_config":
            // check if config has changed
            let config_changed = false
            if (params.daemons.mainnet.remote_host) {
                let remote = this.remotes.find(remote => {
                    return remote.host === params.daemons.mainnet.remote_host && remote.port === params.daemons.mainnet.remote_port
                })
                if (!remote) {
                    try {
                        this.remotes.push({
                            "host": params.daemons.mainnet.remote_host,
                            "port": params.daemons.mainnet.remote_port
                        })
                        fs.writeFile("remotes.json", JSON.stringify(this.remotes, null, 4), "utf8", () => {

                        })
                    } catch {
                    }
                }
            }
            Object.keys(this.config_data).map(i => {
                if (i === "appearance") return
                Object.keys(this.config_data[i]).map(j => {
                    if (this.config_data[i][j] !== params[i][j]) {
                        config_changed = true
                    }
                })
            })
        case "save_config_init":
            Object.keys(params).map(key => {
                this.config_data[key] = Object.assign(this.config_data[key], params[key])
            })

            const validated = Object.keys(this.defaults)
                .filter(k => k in this.config_data)
                .map(k => [k, this.validate_values(this.config_data[k], this.defaults[k])])
                .reduce((map, obj) => {
                    map[obj[0]] = obj[1]
                    return map
                }, {})

            // Validate deamon data
            this.config_data = {
                ...this.config_data,
                ...validated
            }

            fs.writeFile(this.config_file, JSON.stringify(this.config_data, null, 4), "utf8", () => {
                if (data.method === "save_config_init") {
                    this.startup()
                } else {
                    this.send("set_app_data", {
                        config: this.config_data,
                        pending_config: this.config_data
                    })
                    if (config_changed) {
                        this.send("settings_changed_reboot")
                    }
                }
            })
            break
        case "init":
            this.startup()
            break

        case "open_explorer":
            if (params.type === "tx") {
                require("electron").shell.openExternal("http://154.38.165.93/tx/" + params.id)
            }
            break

        case "open_url":
            require("electron").shell.openExternal(params.url)
            break

        case "save_png":
            let filename = dialog.showSaveDialog(this.mainWindow, {
                title: "Save " + params.type,
                filters: [{ name: "PNG", extensions: ["png"] }],
                defaultPath: os.homedir()
            })
            if (filename) {
                let base64Data = params.img.replace(/^data:image\/png;base64,/, "")
                let binaryData = Buffer.from(base64Data, "base64").toString("binary")
                fs.writeFile(filename, binaryData, "binary", (err) => {
                    if (err) {
                        this.send("show_notification", {
                            type: "negative",
                            message: "Error saving " + params.type,
                            timeout: 2000
                        })
                    } else {
                        this.send("show_notification", {
                            message: params.type + " saved to " + filename,
                            timeout: 2000
                        })
                    }
                })
            }
            break

        default:
        }
    }

    startup () {
        this.send("set_app_data", {
            remotes: this.remotes,
            defaults: this.defaults
        })

        fs.readFile(this.config_file, "utf8", async (err, data) => {
            if (err) {
                this.send("set_app_data", {
                    status: {
                        code: -1 // Config not found
                    },
                    config: this.config_data,
                    pending_config: this.config_data
                })
                return
            }

            let disk_config_data = JSON.parse(data)

            // semi-shallow object merge
            Object.keys(disk_config_data).map(key => {
                if (!this.config_data.hasOwnProperty(key)) {
                    this.config_data[key] = {}
                }
                this.config_data[key] = Object.assign(this.config_data[key], disk_config_data[key])
            })

            let port = ""
            let host = ""
            let fastest_time = 1000000
            if (this.config_data.app.scan) {
                for (const i in this.remotes) {
                    if (this.config_data.daemons.mainnet.type === "local") { break }
                    let options = {
                        method: "POST",
                        json: {
                            jsonrpc: "2.0",
                            id: "0",
                            method: "get_info"
                        }
                    }
                    let start = new Date().getTime()

                    try {
                        await fetch("http://" + this.remotes[i].host + ":" + this.remotes[i].port + "/json_rpc", options)
                            .then(() => {
                                let end = new Date().getTime() - start
                                if (end < fastest_time) {
                                    port = this.remotes[i].port
                                    host = this.remotes[i].host
                                    fastest_time = end
                                }
                            })
                    } catch {
                        console.log("http://" + this.remotes[i].host + ":" + this.remotes[i].port + "/json_rpc", "is down")
                    }
                }
            }

            if (port) {
                this.config_data.daemons.mainnet.remote_host = host
                this.config_data.daemons.mainnet.remote_port = port
            }

            // here we may want to check if config data is valid, if not also send code -1
            // i.e. check ports are integers and > 1024, check that data dir path exists, etc
            const validated = Object.keys(this.defaults)
                .filter(k => k in this.config_data)
                .map(k => [k, this.validate_values(this.config_data[k], this.defaults[k])])
                .reduce((map, obj) => {
                    map[obj[0]] = obj[1]
                    return map
                }, {})

            // Make sure the daemon data is valid
            this.config_data = {
                ...this.config_data,
                ...validated
            }

            // save config file back to file, so updated options are stored on disk
            fs.writeFile(this.config_file, JSON.stringify(this.config_data, null, 4), "utf8", () => {
            })

            this.send("set_app_data", {
                config: this.config_data,
                pending_config: this.config_data,
                selected_node: `${host}:${port}`
            })

            // Make the wallet dir
            const { wallet_data_dir, data_dir } = this.config_data.app
            if (!fs.existsSync(wallet_data_dir)) {
                fs.mkdirSync(wallet_data_dir, { recursive: true })
            }

            // Check to see if data and wallet directories exist
            const dirs_to_check = [{
                path: data_dir,
                error: "Data storge path not found"
            },
            {
                path: wallet_data_dir,
                error: "Wallet data storge path not found"
            }]

            for (const dir of dirs_to_check) {
                // Check to see if dir exists
                if (!fs.existsSync(dir.path)) {
                    this.send("show_notification", {
                        type: "negative",
                        message: `Error: ${dir.error}`,
                        timeout: 2000
                    })

                    // Go back to config
                    this.send("set_app_data", {
                        status: {
                            code: -1 // Return to config screen
                        }
                    })
                    return
                }
            }

            const { net_type } = this.config_data.app

            const dirs = {
                "mainnet": this.config_data.app.data_dir,
                "stagenet": path.join(this.config_data.app.data_dir, "stagenet"),
                "testnet": path.join(this.config_data.app.data_dir, "testnet")
            }

            // Make sure we have the directories we need
            const net_dir = dirs[net_type]
            if (!fs.existsSync(net_dir)) {
                fs.mkdirSync(net_dir, { recursive: true })
            }

            const log_dir = path.join(net_dir, "logs")
            if (!fs.existsSync(log_dir)) {
                fs.mkdirSync(log_dir, { recursive: true })
            }

            this.daemon = new Daemon(this)
            this.walletd = new WalletRPC(this)

            this.send("set_app_data", {
                status: {
                    code: 3 // Starting daemon
                }
            })

            // Make sure the remote node provided is accessible
            const config_daemon = this.config_data.daemons[net_type]
            this.daemon.checkRemote(config_daemon).then(data => {
                if (data.error) {
                    // If we can default to local then we do so, otherwise we tell the user  to re-set the node
                    if (config_daemon.type === "local_remote") {
                        this.config_data.daemons[net_type].type = "local"
                        this.send("set_app_data", {
                            config: this.config_data,
                            pending_config: this.config_data
                        })
                        this.send("show_notification", {
                            type: "warning",
                            textColor: "black",
                            message: "Warning: Could not access remote node, switching to local only",
                            timeout: 2000
                        })
                    } else {
                        this.send("show_notification", {
                            type: "negative",
                            message: "Error: Could not access remote node, please try another remote node",
                            timeout: 2000
                        })

                        // Go back to config
                        this.send("set_app_data", {
                            status: {
                                code: -1 // Return to config screen
                            }
                        })
                        return
                    }
                }

                // If we got a net type back then check if ours match
                if (data.net_type && data.net_type !== net_type) {
                    this.send("show_notification", {
                        type: "negative",
                        message: "Error: Remote node is using a different nettype",
                        timeout: 2000
                    })

                    // Go back to config
                    this.send("set_app_data", {
                        status: {
                            code: -1 // Return to config screen
                        }
                    })
                    return
                }

                this.daemon.checkVersion().then(async (version) => {
                    if (version) {
                        this.send("set_app_data", {
                            status: {
                                code: 4,
                                message: version
                            }
                        })
                    } else {
                        // daemon not found, probably removed by AV, set to remote node
                        this.config_data.daemons[net_type].type = "remote"
                        this.send("set_app_data", {
                            status: {
                                code: 5
                            },
                            config: this.config_data,
                            pending_config: this.config_data
                        })
                    }

                    this.daemon.start(this.config_data).then(() => {
                        this.send("set_app_data", {
                            status: {
                                code: 6 // Starting wallet
                            }
                        })

                        this.walletd.start(this.config_data).then(() => {
                            this.send("set_app_data", {
                                status: {
                                    code: 7 // Reading wallet list
                                }
                            })

                            this.walletd.listWallets(true)

                            this.send("set_app_data", {
                                status: {
                                    code: 0 // Ready
                                }
                            })
                            // eslint-disable-next-line
                        }).catch(error => {
                            this.send("set_app_data", {
                                status: {
                                    code: -1 // Return to config screen
                                }
                            })
                        })
                        // eslint-disable-next-line
                    }).catch(error => {
                        this.daemon.killProcess()
                        this.send("show_notification", { type: "negative", message: error.message, timeout: 3000 })
                        if (this.config_data.daemons[net_type].type === "remote") {
                            this.send("show_notification", {
                                type: "negative",
                                message: "Remote daemon cannot be reached",
                                timeout: 3000
                            })
                        } else {
                            this.send("show_notification", { type: "negative", message: error.message, timeout: 3000 })
                        }
                        this.send("set_app_data", {
                            status: {
                                code: -1 // Return to config screen
                            }
                        })
                    })
                    // eslint-disable-next-line
                }).catch(error => {
                    this.send("set_app_data", {
                        status: {
                            code: -1 // Return to config screen
                        }
                    })
                })
            })
        })
    }

    quit () {
        return new Promise(async (resolve, reject) => {
            //let process = []
            try {
                if (this.walletd) {
                    // process.push(this.walletd.quit())
                    await this.walletd.quit()
                    this.walletd = null
                }
                if (this.wss) {
                    this.wss.close()
                    this.wss = null
                }
                if (this.daemon) {
                    //process.push(this.daemon.quit())
                    await this.daemon.quit()
                    this.daemon = null
                }
                this.scee = null
                this.mainWindow = null
            } catch (error) {
                
            }
            finally {
                console.log('backend quit close>>>>>>>>>>')
                resolve()
            }

            // Promise.allSettled(process)
            // .finally(([daemonProcess, walletProcess]) => {
            //     console.log(daemonProcess.status, 'backend quit daemon process')
            //     console.log('backend quit close>>>>>>>>>>')
            //     resolve()
            // })
        })
    }

    // Replace any invalid value with default values
    validate_values (values, defaults) {
        const isDictionary = (v) => typeof v === "object" && v !== null && !(v instanceof Array) && !(v instanceof Date)
        const modified = { ...values }

        // Make sure we have valid defaults
        if (!isDictionary(defaults)) return modified

        for (const key in modified) {
            // Only modify if we have a default
            if (!(key in defaults)) continue

            const defaultValue = defaults[key]
            const invalidDefault = defaultValue === null || defaultValue === undefined || Number.isNaN(defaultValue)
            if (invalidDefault) continue

            const value = modified[key]

            // If we have a object then recurse through it
            if (isDictionary(value)) {
                modified[key] = this.validate_values(value, defaultValue)
            } else {
                // Check if we need to replace the value
                const isValidValue = !(value === undefined || value === null || value === "" || Number.isNaN(value))
                if (isValidValue) continue

                // Otherwise set the default value
                modified[key] = defaultValue
            }
        }
        return modified
    }
}
