import React, {useEffect} from 'react';
import './Home.css';
import {endpoint} from "../Utils/Constants.ts";
import {getImgSrc} from "../Utils/Utils.tsx";

function Home() {
    useEffect(() => {
        async function fetchData() {
            try {
                const postResponse = await fetch(endpoint + '/post').then(res => res.json());

                for (const post of postResponse) {
                    const contentResponse = await fetch(endpoint + '/content/' + post.id).then(res => res.json());
                    const contentList: string[] = [];

                    for (const content of contentResponse) {
                        contentList.push(content.data);
                    }

                    const postElement = createPost(post.username, post.description, contentList);
                    const mainElement = document.getElementById('post_div');

                    if (mainElement) {
                        mainElement.appendChild(postElement);
                    }
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        }

        fetchData();
    }, []);

    function createPost(user: string, description: string, content: string[]): HTMLElement {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        const userElement = document.createElement('h2');
        userElement.textContent = user;
        postElement.appendChild(userElement);

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = description;
        postElement.appendChild(descriptionElement);

        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'post-images';
        content.forEach((image, index) => {
            try {
                const imgSrc = getImgSrc(image);
                const imgElement = document.createElement('img');

                imgElement.src = imgSrc;
                imgElement.alt = `Content ${index + 1}`;
                imagesContainer.appendChild(imgElement);
            } catch (error) {}
        });
        postElement.appendChild(imagesContainer);

        return postElement;
    }

    return (
        <div className="Home">
            <main className="Home-main" id="post_div">
                <div className="post">
                    <img src="https://www.svgrepo.com/show/474300/chef-hat.svg" alt="Chef Hat" />
                    <p>Chef John Doe's latest creation: Spaghetti Carbonara</p>
                </div>
                <div className="post">
                    <img src="https://www.svgrepo.com/show/474300/chef-hat.svg" alt="Chef Hat" />
                    <p>Chef Jane Smith's latest creation: Chocolate Cake</p>
                </div>
            </main>
        </div>
    );
}

export default Home;