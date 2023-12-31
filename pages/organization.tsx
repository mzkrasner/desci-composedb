import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { BasicProfile } from "@datamodels/identity-profile-basic";
import { startLitClient } from "../utils/client";
import {
  _encryptWithLit,
  _decryptWithLit,
  encodeb64,
  decodeb64,
} from "../utils/lit";
import ceramicLogo from "../public/ceramic.png";
import { useCeramicContext } from "../context";
import { authenticateCeramic } from "../utils";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const clients = useCeramicContext();
  const { ceramic, composeClient } = clients;
  const [profile, setProfile] = useState<BasicProfile | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [val, setVal] = useState("");
  const [res, setRes] = useState("");
  

  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient);
    await getProfile();
  };

  const getProfile = async () => {
    setLoading(true);
    if (ceramic.did !== undefined) {
      const profile = await composeClient.executeQuery(`
        query {
          viewer {
            basicProfile {
              id
              name
              description
              gender
              emoji
            }
          }
        }
      `);
      setProfile(profile?.data?.viewer?.basicProfile);
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    setLoading(true);
    if (ceramic.did !== undefined ) {
     
      const query = await composeClient.executeQuery(`
        mutation {
          createOrganization(input: {
            content: {
              name: "${val}"
            }
          }) 
          {
            document {
              id
              author{
                id
              }
              name
            }
          }
        }
      `);
      console.log(query);
      setRes(JSON.stringify(query))
      await getProfile();
      setLoading(false);
    }
    setVal("");
  };


  /**
   * On load check if there is a DID-Session in local storage.
   * If there is a DID-Session we can immediately authenticate the user.
   * For more details on how we do this check the 'authenticateCeramic function in`../utils`.
   */
  useEffect(() => {
    if (localStorage.getItem("did")) {
      handleLogin();
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create ceramic app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {profile === undefined && ceramic.did === undefined ? (
          <button
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
        ) : (
          <>
            {" "}
            <div className={styles.formGroup2}>
              <label>Result </label>
              <textarea
                style={{"height": "20rem", "width": "50rem",  "padding": "1rem"}}
                value={res}
                onChange={(e) => {
                  setRes(e.target.value);
                }}
              />
            </div>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Organization Name</label>
                <textarea
                  style={{"height": "3rem", "width": "20rem", "padding": "1rem"}}
                  value={val}
                  onChange={(e) => {
                    setVal(e.target.value);
                  }}
                />
              </div>
              <button
                onClick={() => {
                    createOrganization();
                }}
              >
                {loading ? "Loading..." : "Create Organization"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
