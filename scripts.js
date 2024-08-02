// Script to handle card clicks or any other interactivity
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (event) => {
        event.preventDefault();
        // You can add your custom logic here
        alert('This card will be redirected to a detailed page!');
    });
});
